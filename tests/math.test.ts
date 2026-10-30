import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { add, subtract, multiply, divide, power, calculate } from '../src/math.ts';

describe('Math module', () => {
  it('adds numbers', () => {
    assert.equal(add(2, 3), 5);
    assert.equal(add(-1, 1), 0);
    assert.equal(add(0, 0), 0);
  });

  it('subtracts numbers', () => {
    assert.equal(subtract(10, 4), 6);
    assert.equal(subtract(2, 5), -3);
  });

  it('multiplies numbers', () => {
    assert.equal(multiply(3, 7), 21);
    assert.equal(multiply(-2, 4), -8);
    assert.equal(multiply(5, 0), 0);
  });

  it('divides numbers', () => {
    assert.equal(divide(20, 4), 5);
    assert.equal(divide(7, 2), 3.5);
  });

  it('rejects division by zero', () => {
    assert.throws(() => divide(10, 0), /Division by zero is not permitted/);
  });

  it('calculates powers', () => {
    assert.equal(power(2, 3), 8);
    assert.equal(power(5, 0), 1);
  });

  it('dispatches supported operations', () => {
    assert.equal(calculate(4, 5, 'add'), 9);
    assert.equal(calculate(15, 3, 'divide'), 5);
  });

  it('rejects unsupported operations at runtime', () => {
    assert.throws(
      () => calculate(1, 2, 'modulus' as never),
      /Unsupported operation/,
    );
  });
});
