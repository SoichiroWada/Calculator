import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { DIGITS, initialState, reducer, toCells } from './calculator.js';
import { NixieDigit, NixieStack } from './NixieDigit.jsx';

// White keypad (3 x 4). The bottom-right "C" of the original is a decimal point here.
const NUM_KEYS = [
  { id: '7', label: '7' }, { id: '8', label: '8' }, { id: '9', label: '9' },
  { id: '4', label: '4' }, { id: '5', label: '5' }, { id: '6', label: '6' },
  { id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' },
  { id: '0', label: '0', wide: true }, { id: '.', label: '.' },
];

// Black keypad (2 x 3)
const OP_KEYS = [
  { id: '*', label: '×', hint: '*' }, { id: '/', label: '÷', hint: '/' },
  { id: '+', label: '+', hint: '+' }, { id: '-', label: '−', hint: '-' },
  { id: 'C', label: 'C', hint: 'Space / Del' }, { id: '=', label: '=', hint: 'Enter' },
];

// Physical keyboard → calculator key
function mapKey(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  const k = e.key;
  if (/^[0-9]$/.test(k)) return k;
  if (k === '.' || e.code === 'NumpadDecimal') return '.';
  if (['*', '/', '+', '-'].includes(k)) return k;
  if (k === ' ' || k === 'Spacebar' || k === 'Delete') return 'C';
  if (k === 'Enter' || k === '=') return '=';
  if (k === 'Backspace') return 'BS';
  return null;
}

// Thousands markers sit after every 3rd digit counting from the right.
const MARKER_AFTER = new Set(
  Array.from({ length: DIGITS }, (_, i) => i).filter(
    (i) => i < DIGITS - 1 && (DIGITS - 1 - i) % 3 === 0,
  ),
);

const TEST_CELLS = Array.from({ length: DIGITS }, () => ({ digit: '0', dot: false }));
const DARK_CELLS = Array.from({ length: DIGITS }, () => ({ digit: null, dot: false }));

function Tube({ digit, dot }) {
  return (
    <div className={`tube${digit !== null ? ' lit' : ''}`}>
      <span className="ghost"><NixieStack /></span>
      {digit !== null && <span className="digit"><NixieDigit ch={digit} /></span>}
      <span className={`dot${dot ? ' on' : ''}`} />
    </div>
  );
}

function Display({ power, state }) {
  let cells = DARK_CELLS;
  let sign = null;
  if (power === 'test') cells = TEST_CELLS;
  if (power === 'on') {
    cells = toCells(state.error ? '0' : state.entry);
    if (state.error) sign = 'E';
    else if (state.entry.startsWith('-')) sign = '−';
  }
  const readout = power === 'off' ? 'off' : state.error ? 'Error' : state.entry;

  return (
    <div className="display-area">
      <div className="hood">
        <div className="glass" role="status" aria-live="polite" aria-label={`Display: ${readout}`}>
          <div className={`tube sign${sign ? ' lit' : ''}`}>
            {sign && <span className="digit"><NixieDigit ch={sign} /></span>}
          </div>
          {cells.map((c, i) => <Tube key={i} {...c} />)}
        </div>
      </div>
      <div className="markers" aria-hidden="true">
        <div className="slot" />
        {cells.map((_, i) => (
          <div key={i} className="slot">{MARKER_AFTER.has(i) && <span className="marker" />}</div>
        ))}
      </div>
    </div>
  );
}

function Key({ k, kind, pressed, onPress }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={`key ${kind}${k.wide ? ' wide' : ''}${pressed ? ' pressed' : ''}`}
      onPointerDown={(e) => { e.preventDefault(); onPress(k.id); }}
      aria-label={k.id === '.' ? 'decimal point' : k.label}
      title={k.hint}
    >
      <span className="cap">{k.label}</span>
    </button>
  );
}

export default function App() {
  const [power, setPower] = useState('off'); // 'off' | 'test' | 'on'
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pressed, setPressed] = useState(null);
  const pressTimer = useRef(null);
  const powerRef = useRef(power);
  powerRef.current = power;

  // Power-on lamp test: all 21 tubes show "0" for one second.
  useEffect(() => {
    if (power !== 'test') return undefined;
    const t = setTimeout(() => setPower('on'), 1000);
    return () => clearTimeout(t);
  }, [power]);

  const togglePower = () => {
    dispatch('C');
    setPower((p) => (p === 'off' ? 'test' : 'off'));
  };

  const press = useCallback((id) => {
    setPressed(id);
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setPressed(null), 110);
    if (powerRef.current === 'on') dispatch(id);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const id = mapKey(e);
      if (!id) return;
      e.preventDefault();
      press(id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  return (
    <main className="stage">
      <p className="rotate-hint">Rotate your phone to landscape for the best view</p>
      <div className={`calc power-${power}`}>
        <div className="panel">
          <Display power={power} state={state} />

          <div className="lower">
            <div className="left">
              <div className="badge"><span className="brand">Casio</span><span className="model">AS-A</span></div>
              <div className="power">
                <span className="engrave">OFF</span>
                <button
                  type="button"
                  tabIndex={-1}
                  className={`switch${power !== 'off' ? ' on' : ''}`}
                  onClick={togglePower}
                  aria-pressed={power !== 'off'}
                  aria-label="Power"
                >
                  <span className="rocker" />
                </button>
                <span className="engrave">ON</span>
                <span className={`lamp${power !== 'off' ? ' on' : ''}`} />
              </div>
            </div>

            <div className="keypads">
              <div className="numpad">
                {NUM_KEYS.map((k) => (
                  <Key key={k.id} k={k} kind="white" pressed={pressed === k.id} onPress={press} />
                ))}
              </div>
              <div className="oppad">
                {OP_KEYS.map((k) => (
                  <Key key={k.id} k={k} kind="black" pressed={pressed === k.id} onPress={press} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="help">
        Keys: 0–9 &nbsp;·&nbsp; . &nbsp;·&nbsp; * / + − &nbsp;·&nbsp; Enter = &nbsp;·&nbsp;
        Space / Delete = C &nbsp;·&nbsp; Backspace erases last digit
      </p>
    </main>
  );
}
