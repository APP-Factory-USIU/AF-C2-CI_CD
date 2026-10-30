import "dotenv/config";
import { createApp } from "./index.js";

try {
  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, "0.0.0.0", () => {
    console.log(`[INFO] Calculator service listening on port ${port}`);
    console.log(`[INFO] Health check: http://localhost:${port}/health`);
    console.log(`[INFO] Calculator: http://localhost:${port}/calculate`);
  });
} catch (error) {
  console.error("[FATAL] Server initialization failed:", error);
  process.exit(1);
}
