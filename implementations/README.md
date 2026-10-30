# Standalone implementations

Two independent rewrites of the calculator API, separate from the root Vite frontend:

- [TypeScript / Express](typescript/README.md)
- [Python / Flask](python/README.md)

Both expose public `GET /health` and API-key-protected `GET /calculate?a=12&b=4&op=multiply` and `POST /calculate` (JSON: `{"a":12,"b":4,"operation":"multiply"}`). Supported operations: add, subtract, multiply, divide, power. Send credentials using `x-api-key` or `apiKey`. Missing/incorrect credentials return 401; invalid inputs, unknown operations, and division by zero return 400. Startup fails when API_KEY is missing, blank, or the example placeholder.
