import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createApp, validateEnv } from '../src/app.ts';

describe('Application environment and API setup', () => {
  it('accepts a configured API_KEY', () => {
    const previous = process.env.API_KEY;
    try {
      process.env.API_KEY = 'valid_test_secret_key_123';
      assert.doesNotThrow(() => validateEnv());
    } finally {
      if (previous === undefined) delete process.env.API_KEY;
      else process.env.API_KEY = previous;
    }
  });

  it('rejects a missing API_KEY', () => {
    const previous = process.env.API_KEY;
    try {
      delete process.env.API_KEY;
      assert.throws(
        () => validateEnv(),
        /Missing required environment variable "API_KEY"/,
      );
    } finally {
      if (previous === undefined) delete process.env.API_KEY;
      else process.env.API_KEY = previous;
    }
  });

  it('rejects the default placeholder API_KEY', () => {
    const previous = process.env.API_KEY;
    try {
      process.env.API_KEY = 'your_secret_here_replace_me';
      assert.throws(
        () => validateEnv(),
        /Missing required environment variable "API_KEY"/,
      );
    } finally {
      if (previous === undefined) delete process.env.API_KEY;
      else process.env.API_KEY = previous;
    }
  });

  it('creates the Express application when API_KEY is configured', () => {
    const previous = process.env.API_KEY;
    try {
      process.env.API_KEY = 'ci_test_pipeline_key';
      assert.ok(createApp());
    } finally {
      if (previous === undefined) delete process.env.API_KEY;
      else process.env.API_KEY = previous;
    }
  });

  it('refuses to create the application without API_KEY', () => {
    const previous = process.env.API_KEY;
    try {
      delete process.env.API_KEY;
      assert.throws(
        () => createApp(),
        /Missing required environment variable "API_KEY"/,
      );
    } finally {
      if (previous === undefined) delete process.env.API_KEY;
      else process.env.API_KEY = previous;
    }
  });
});
