import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import cookieParser from "cookie-parser";
import cors from "cors";
import { setDefaultResultOrder } from "dns";
import express from "express";
import helmet from "helmet";
import cron from "node-cron";
import { initPool } from "./db/pool";
import { authRouter } from "./modules/auth/auth.router";
import { cleanUnverifiedAccounts } from "./modules/auth/auth.service";
import { establishementRouter } from "./modules/establishments/establishments.router";
import { utilschemaRouter } from "./modules/other/other.router";

setDefaultResultOrder("ipv4first");

const app = express();
const PORT = process.env.PORT || 3434;
const isProd = process.env.NODE_ENV === "production";

app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = isProd ? process.env.CLIENT_URL : "http://localhost:8080";
      if (!origin || origin === allowed) {
        callback(null, true);
      } else {
        console.error(`CORS blocked: ${origin} !== ${allowed}`);
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/utils", utilschemaRouter);
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
      console.log(`MyScholaria API → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[!!CRASH] Erreur démarrage:", err.message);
    process.exit(1);
  });
