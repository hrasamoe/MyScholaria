import express from "express";
import cors from "cors";
import helmet from "helmet";
import { initPool } from "./db/pool";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { setDefaultResultOrder } from "dns";
import { authRouter } from "./modules/auth/auth.router";
setDefaultResultOrder("ipv4first");

const app = express();
const PORT = process.env.PORT || 4242;

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use("/api/auth", authRouter);

app.get("/api/health", (_, res) => {
  res.json({ status: "ok", project: "MyScholaria" });
});

initPool()
  .then(() => {
    app.listen(PORT, () => {
      console.log(` MyScholaria API → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[!!CRASH] Erreur démarrage:", err.message);
    process.exit(1);
  });
