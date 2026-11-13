// Nixie-tube cathode shapes, drawn as thin wire strokes (viewBox 30 x 50),
// modelled on the tall, narrow numerals of the Casio AS-A display.
const SIX =
  'M23 7.5 C21 5 18.5 4 15.5 4 C8 4 4 13 4 28 C4 40 9 46 15 46 ' +
  'C21.5 46 26 40.5 26 34 C26 27 21.5 22 15.5 22 C9.5 22 5 26 4 31';

const PATHS = {
  0: 'M15 4 C21.5 4 26 12 26 25 C26 38 21.5 46 15 46 C8.5 46 4 38 4 25 C4 12 8.5 4 15 4 Z',
  1: 'M9 11 L16 4 L16 46',
  2: 'M4.5 13 C5 7.5 9.5 4 15 4 C21 4 25.5 8 25.5 14 C25.5 21 20 26.5 4 46 L26 46',
  3: 'M5 4 L25 4 L13.5 20.5 C21 20 26 25.5 26 33 C26 41 21 46 15 46 C9.5 46 5.5 43.5 4 38.5',
  4: 'M21 46 L21 4 L4 33 L27 33',
  5: 'M25 4 L7 4 L5.5 22 C8 19.5 11.5 18.5 15 18.5 C21.5 18.5 26 24 26 32 ' +
     'C26 40.5 21 46 15 46 C9.5 46 5.5 43.5 4 38.5',
  6: SIX,
  7: 'M4 4 L26 4 L11 46',
  8: 'M15 23 C9.5 23 6 19 6 13.5 C6 8 10 4 15 4 C20 4 24 8 24 13.5 C24 19 20.5 23 15 23 ' +
     'C8.5 23 4 28 4 34.5 C4 41 9 46 15 46 C21 46 26 41 26 34.5 C26 28 21.5 23 15 23 Z',
  9: SIX, // the 9 cathode is the 6 turned upside down
  '−': 'M6 25 L24 25',
  E: 'M25 4 L5 4 L5 46 L25 46 M5 25 L21 25',
};

function Cathode({ ch }) {
  const d = PATHS[ch];
  if (!d) return null;
  return <path d={d} transform={ch === '9' ? 'rotate(180 15 25)' : undefined} />;
}

// One glowing numeral (wire + hot core).
export function NixieDigit({ ch }) {
  return (
    <svg className="nixie lit-cathode" viewBox="0 0 30 50" aria-hidden="true">
      <g className="wire"><Cathode ch={ch} /></g>
      <g className="core"><Cathode ch={ch} /></g>
    </svg>
  );
}

// All unlit cathodes stacked behind each other, faintly visible through the glass.
const STACK = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
export function NixieStack() {
  return (
    <svg className="nixie stack" viewBox="0 0 30 50" aria-hidden="true">
      {STACK.map((c) => <Cathode key={c} ch={c} />)}
    </svg>
  );
}
