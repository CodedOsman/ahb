import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./db";
import publicRoutes from "./routes/public";
import adminRoutes from "./routes/admin";
import checkoutRoutes from "./routes/checkout";

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Initialize Database
  await initDb();

  app.use(cors());

  // Webhook needs raw body, mount before express.json()
  app.use("/api/checkout/webhook", express.raw({ type: 'application/json' }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.use("/api/checkout", checkoutRoutes);
  app.use("/api", publicRoutes);
  app.use("/api/admin", adminRoutes);


  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

