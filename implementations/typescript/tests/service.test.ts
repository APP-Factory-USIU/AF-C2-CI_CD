import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { calculate, createApp, validateEnv } from "../src/index.js";

describe("arithmetic behavior", () => {
  it("supports all five operations", () => {
    assert.equal(calculate(2, 3, "add"), 5);
    assert.equal(calculate(7, 3, "subtract"), 4);
    assert.equal(calculate(3, 4, "multiply"), 12);
    assert.equal(calculate(12, 4, "divide"), 3);
    assert.equal(calculate(2, 3, "power"), 8);
  });
  it("rejects division by zero", () => assert.throws(() => calculate(1, 0, "divide"), /Division by zero/));
});

describe("HTTP service", () => {
  let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
  let base: string;
  before(async () => {
    process.env.NODE_ENV = "test";
    process.env.API_KEY = "test-secret";
    server = createApp().listen(0);
    await new Promise<void>(resolve => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Missing server address");
    base = `http://127.0.0.1:${address.port}`;
  });
  after(async () => { await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())); });
  it("serves public health", async () => {
    const response = await fetch(`${base}/health`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, "healthy");
  });
  it("protects calculation and supports GET/POST", async () => {
    assert.equal((await fetch(`${base}/calculate?a=1&b=2`)).status, 401);
    const get = await fetch(`${base}/calculate?a=12&b=4&op=multiply`, { headers: { "x-api-key": "test-secret" } });
    assert.equal((await get.json()).result, 48);
    const post = await fetch(`${base}/calculate`, { method: "POST", headers: { "content-type": "application/json", "x-api-key": "test-secret" }, body: JSON.stringify({ a: 10, b: 2, operation: "divide" }) });
    assert.equal((await post.json()).result, 5);
  });
  it("returns 400 for invalid values and division by zero", async () => {
    const headers = { "x-api-key": "test-secret" };
    assert.equal((await fetch(`${base}/calculate?a=x&b=1`, { headers })).status, 400);
    assert.equal((await fetch(`${base}/calculate?a=1&b=0&op=divide`, { headers })).status, 400);
  });
});

describe("configuration", () => {
  it("rejects absent and placeholder API keys", () => {
    const old = process.env.API_KEY;
    delete process.env.API_KEY;
    assert.throws(validateEnv, /API_KEY/);
    process.env.API_KEY = "your_secret_here_replace_me";
    assert.throws(validateEnv, /API_KEY/);
    process.env.API_KEY = old ?? "test-secret";
  });
});
