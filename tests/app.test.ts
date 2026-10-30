import { createApp, validateEnv } from '../src/app.ts';

describe('Application Environment & API Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clone process.env before each test to isolate mutations
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Environment Variable Validation', () => {
    test('passes validation when API_KEY is set in environment', () => {
      process.env.API_KEY = 'valid_test_secret_key_123';
      expect(() => validateEnv()).not.toThrow();
    });

    test('throws fatal configuration error when API_KEY is missing', () => {
      delete process.env.API_KEY;
      expect(() => validateEnv()).toThrow(/Missing required environment variable "API_KEY"/);
    });

    test('throws fatal configuration error when API_KEY is default placeholder', () => {
      process.env.API_KEY = 'your_secret_here_replace_me';
      expect(() => validateEnv()).toThrow(/Missing required environment variable "API_KEY"/);
    });
  });

  describe('Express App Initialization', () => {
    test('successfully instantiates when valid API_KEY is provided', () => {
      process.env.API_KEY = 'ci_test_pipeline_key';
      const app = createApp();
      expect(app).toBeDefined();
    });

    test('refuses to start when API_KEY is omitted in test runner', () => {
      delete process.env.API_KEY;
      expect(() => createApp()).toThrow(/Missing required environment variable "API_KEY"/);
    });
  });
});
