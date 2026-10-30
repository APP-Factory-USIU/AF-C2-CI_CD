import { add, subtract, multiply, divide, power, calculate } from '../src/math.ts';

describe('Math Module Unit Tests', () => {
  describe('Basic Operations', () => {
    test('adds two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
      expect(add(0, 0)).toBe(0);
    });

    test('subtracts two numbers correctly', () => {
      expect(subtract(10, 4)).toBe(6);
      expect(subtract(2, 5)).toBe(-3);
    });

    test('multiplies two numbers correctly', () => {
      expect(multiply(3, 7)).toBe(21);
      expect(multiply(-2, 4)).toBe(-8);
      expect(multiply(5, 0)).toBe(0);
    });

    test('divides two numbers correctly', () => {
      expect(divide(20, 4)).toBe(5);
      expect(divide(7, 2)).toBe(3.5);
    });

    test('throws error on division by zero', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero is not permitted');
    });

    test('computes power exponents correctly', () => {
      expect(power(2, 3)).toBe(8);
      expect(power(5, 0)).toBe(1);
    });
  });

  describe('Calculator Dispatcher', () => {
    test('dispatches add operation', () => {
      expect(calculate(4, 5, 'add')).toBe(9);
    });

    test('dispatches divide operation', () => {
      expect(calculate(15, 3, 'divide')).toBe(5);
    });

    test('throws error for unsupported operation', () => {
      // @ts-expect-error testing invalid runtime input
      expect(() => calculate(1, 2, 'modulus')).toThrow('Unsupported operation');
    });
  });
});
