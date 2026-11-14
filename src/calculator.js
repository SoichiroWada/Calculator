// Pure calculator engine for the virtual Casio AS-A.
// All arithmetic goes through decimal.js so results are exact decimals
// (0.1 + 0.2 = 0.3) and never suffer from binary floating-point error.
import Decimal from 'decimal.js';

export const DIGITS = 21;

Decimal.set({ precision: 80, rounding: Decimal.ROUND_HALF_UP });

export const initialState = {
  entry: '0', // what the tubes show (current input or last result)
  acc: null, // left operand (string) while an operator is pending
  op: null, // pending operator: '+', '-', '*', '/'
  fresh: true, // next digit starts a new number
  lastOp: null, // for repeated "=" (constant calculation)
  lastOperand: null,
  error: false,
};

const countDigits = (s) => s.replace(/[-.]/g, '').length;

// Fit a Decimal into 21 tubes: round the fractional part to whatever
// room is left, drop trailing zeros, and flag overflow when the integer
// part alone needs more than 21 digits.
export function formatResult(value) {
  if (value.isZero()) return '0';
  const intDigits = value.abs().trunc().isZero()
    ? 1
    : value.abs().trunc().toFixed().length;
  if (intDigits > DIGITS) return null;
  let rounded = value.toDecimalPlaces(DIGITS - intDigits);
  if (rounded.isZero()) return '0';
  let s = rounded.toFixed(); // plain notation, no exponent, no trailing zeros
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  if (countDigits(s) > DIGITS) return null; // rounding carried into a 22nd digit
  return s;
}

function compute(a, op, b) {
  const x = new Decimal(a);
  const y = new Decimal(b);
  switch (op) {
    case '+': return formatResult(x.plus(y));
    case '-': return formatResult(x.minus(y));
    case '*': return formatResult(x.times(y));
    case '/': return y.isZero() ? null : formatResult(x.dividedBy(y));
    default: return formatResult(y);
  }
}

const errorState = { ...initialState, error: true };

function inputDigit(state, d) {
  if (state.fresh) {
    return { ...state, entry: d === '.' ? '0.' : d, fresh: false };
  }
  const { entry } = state;
  if (d === '.') {
    if (entry.includes('.')) return state;
    return { ...state, entry: entry + '.' };
  }
  if (countDigits(entry) >= DIGITS) return state;
  if (entry === '0') return { ...state, entry: d };
  if (entry === '-0') return { ...state, entry: '-' + d };
  return { ...state, entry: entry + d };
}

// "-" pressed before any number starts a negative first operand.
const isPristine = (s) => s.fresh && !s.op && s.acc === null && s.entry === '0';

function inputOperator(state, o) {
  if (o === '-' && isPristine(state)) return { ...state, entry: '-0', fresh: false };
  if (state.entry === '-0' && !state.fresh) {
    // Only the sign has been typed: "-" again cancels it, other operators are ignored.
    return o === '-' ? { ...state, entry: '0', fresh: true } : state;
  }
  if (state.op && !state.fresh) {
    const result = compute(state.acc, state.op, state.entry);
    if (result === null) return errorState;
    return { ...state, entry: result, acc: result, op: o, fresh: true };
  }
  if (state.op) return { ...state, op: o }; // operator pressed twice: replace it
  return { ...state, acc: state.entry, op: o, fresh: true };
}

function equals(state) {
  if (state.op) {
    const operand = state.entry;
    const result = compute(state.acc, state.op, operand);
    if (result === null) return errorState;
    return {
      ...state, entry: result, acc: null, op: null, fresh: true,
      lastOp: state.op, lastOperand: operand,
    };
  }
  if (state.lastOp) {
    // Repeated "=" re-applies the last operation (e.g. 2 * 3 = = → 6, 18)
    const result = compute(state.entry, state.lastOp, state.lastOperand);
    if (result === null) return errorState;
    return { ...state, entry: result, fresh: true };
  }
  return { ...state, fresh: true };
}

function backspace(state) {
  if (state.fresh) return state; // only the number being typed can be edited
  let entry = state.entry.slice(0, -1);
  if (entry === '' || entry === '-') entry = '0';
  return { ...state, entry };
}

export function reducer(state, key) {
  if (key === 'C') return initialState;
  if (state.error) return state; // only C clears an error
  if (/^[0-9.]$/.test(key)) return inputDigit(state, key);
  if (['+', '-', '*', '/'].includes(key)) return inputOperator(state, key);
  if (key === '=') return equals(state);
  if (key === 'BS') return backspace(state);
  return state;
}

// Turn an entry string into 21 tube cells (right aligned).
// Each cell: { digit: '0'-'9' | '−' | null, dot: boolean }
// A negative number gets its minus sign in the tube just left of its
// highest digit; when all 21 tubes are digits, the minus does not fit
// (the caller shows it in the separate sign tube instead).
export function toCells(entry) {
  const cells = [];
  for (const ch of entry.replace('-', '')) {
    if (ch === '.') {
      if (cells.length) cells[cells.length - 1].dot = true;
    } else {
      cells.push({ digit: ch, dot: false });
    }
  }
  if (entry.startsWith('-') && cells.length < DIGITS) cells.unshift({ digit: '−', dot: false });
  while (cells.length < DIGITS) cells.unshift({ digit: null, dot: false });
  return cells.slice(-DIGITS);
}
