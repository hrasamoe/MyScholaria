// src/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { initPool } from "./db/pool"; // ← importe initPool pas le pool directement

const app = express();
const PORT = process.env.PORT || 4242;

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_, res) => {
  res.json({ status: "ok", project: "MyScholaria" });
});

// ← initPool d'abord, puis démarrer le serveur
initPool()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 MyScholaria API → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur démarrage:", err.message);
    process.exit(1);
  });
