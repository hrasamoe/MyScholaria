import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { initPool } from "./db/pool";
import dotenv from "dotenv";
import path from "path";
import cron from "node-cron";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { setDefaultResultOrder } from "dns";
import { authRouter } from "./modules/auth/auth.router";
import { cleanUnverifiedAccounts } from "./modules/auth/auth.service";
setDefaultResultOrder("ipv4first");
import { establishementRouter } from "./modules/establishments/establishments.router";

const app = express();
const PORT = process.env.PORT || 4242;

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/establishment", establishementRouter);
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", project: "MyScholaria" });
});

cron.schedule("0 0 * * *", async () => {
  await cleanUnverifiedAccounts();
  console.log("Cleaned unverified accounts");
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
