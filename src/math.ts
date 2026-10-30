/**
 * Math utility module for course demonstration.
 * Provides pure arithmetic functions with explicit boundary validation.
 */

export type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power';

export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero is not permitted');
  }
  return a / b;
}

export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

export function calculate(a: number, b: number, operation: MathOperation): number {
  switch (operation) {
    case 'add':
      return add(a, b);
    case 'subtract':
      return subtract(a, b);
    case 'multiply':
      return multiply(a, b);
    case 'divide':
      return divide(a, b);
    case 'power':
      return power(a, b);
    default:
      throw new Error(`Unsupported operation: "${operation}"`);
  }
}
