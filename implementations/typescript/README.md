# TypeScript / Express

Independent implementation of the calculator API. Requires Node.js 22+.

```bash
cd implementations/typescript
npm install
cp .env.example .env
# Set API_KEY in .env to a non-placeholder secret.
npm test
npm run lint
npm run build
npm start
```

Run with Docker:

```bash
docker build -t calculator-typescript .
docker run --rm -p 3000:3000 --env-file .env calculator-typescript
```

API: public `GET /health`; authenticated `GET /calculate?a=12&b=4&op=multiply`; authenticated `POST /calculate` with JSON `{"a":12,"b":4,"operation":"multiply"}`. Use `x-api-key` header or `apiKey` query parameter. Operations: add, subtract, multiply, divide, power. Missing/incorrect credentials return 401; invalid input, unknown operation, and division by zero return 400.
