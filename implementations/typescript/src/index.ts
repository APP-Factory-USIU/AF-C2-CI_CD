import express, { type Request, type Response, type NextFunction } from "express";

type Operation = "add" | "subtract" | "multiply" | "divide" | "power";
const operations = new Set<Operation>(["add", "subtract", "multiply", "divide", "power"]);

export function calculate(a: number, b: number, op: Operation): number {
  switch (op) {
    case "add": return a + b;
    case "subtract": return a - b;
    case "multiply": return a * b;
    case "divide":
      if (b === 0) throw new Error("Division by zero is not permitted");
      return a / b;
    case "power": return Math.pow(a, b);
  }
}

export function validateEnv(): void {
  const key = process.env.API_KEY;
  if (!key || !key.trim() || key === "your_secret_here_replace_me") {
    throw new Error('FATAL ERROR [CONFIG]: Missing required environment variable "API_KEY".');
  }
}

export function createApp() {
  validateEnv();
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => res.status(200).json({
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  }));

  const requireApiKey = (req: Request, res: Response, next: NextFunction): void => {
    const key = req.headers["x-api-key"] || req.query.apiKey;
    if (key !== process.env.API_KEY) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing API key. Provide the x-api-key header or apiKey query parameter.",
      });
      return;
    }
    next();
  };

  const handler = (req: Request, res: Response): void => {
    try {
      const a = Number(req.body?.a ?? req.query.a);
      const b = Number(req.body?.b ?? req.query.b);
      const op = String(req.body?.operation ?? req.query.op ?? "add");
      if (Number.isNaN(a) || Number.isNaN(b)) {
        res.status(400).json({ error: "Bad Request", message: 'Parameters "a" and "b" must be valid numeric values.' });
        return;
      }
      if (!operations.has(op as Operation)) throw new Error(`Unsupported operation: "${op}"`);
      res.status(200).json({ a, b, operation: op, result: calculate(a, b, op as Operation), timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(400).json({ error: "Calculation Error", message: error instanceof Error ? error.message : "Unknown calculation error" });
    }
  };

  app.get("/calculate", requireApiKey, handler);
  app.post("/calculate", requireApiKey, handler);
  return app;
}
