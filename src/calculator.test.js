import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reducer, initialState, toCells } from './calculator.js';

const run = (keys) => [...keys].reduce(reducer, initialState);
const show = (keys) => {
  const s = run(keys);
  return s.error ? 'E' : s.entry;
};

test('decimal arithmetic has no float rounding errors', () => {
  assert.equal(show('0.1+0.2='), '0.3');
  assert.equal(show('1.1*3='), '3.3');
  assert.equal(show('0.3-0.1='), '0.2');
});

test('chained operations and operator replacement', () => {
  assert.equal(show('2+3*4='), '20'); // simple calculator: left to right
  assert.equal(show('9+-4='), '5');
  assert.equal(show('3-5='), '-2');
});

test('repeated equals', () => {
  assert.equal(show('2*3=='), '18');
  assert.equal(show('10-1==='), '7');
});

test('division fills the 21-digit display', () => {
  assert.equal(show('1/3='), '0.33333333333333333333');
  assert.equal(show('2/3='), '0.66666666666666666667');
  assert.equal(show('10/4='), '2.5');
});

test('21 digit entry limit, single decimal point', () => {
  assert.equal(show('1234567890123456789012345'), '123456789012345678901');
  assert.equal(show('1..5.'), '1.5');
  assert.equal(show('.5'), '0.5');
});

test('backspace edits only the current entry', () => {
  let s = run('123');
  s = reducer(s, 'BS');
  assert.equal(s.entry, '12');
  s = reducer(reducer(reducer(s, 'BS'), 'BS'), 'BS');
  assert.equal(s.entry, '0');
  const r = reducer(run('2+2='), 'BS');
  assert.equal(r.entry, '4');
});

test('errors: divide by zero and overflow', () => {
  assert.equal(show('5/0='), 'E');
  assert.equal(show('999999999999999999999+1='), 'E');
  assert.equal(reducer(run('5/0='), 'C').entry, '0');
});

test('toCells right-aligns and places decimal dots', () => {
  const cells = toCells('-12.5');
  assert.equal(cells.length, 21);
  assert.deepEqual(cells.slice(-3), [
    { digit: '1', dot: false },
    { digit: '2', dot: true },
    { digit: '5', dot: false },
  ]);
  assert.equal(cells[0].digit, null);
});
