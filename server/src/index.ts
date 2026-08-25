import express from "express";
import type { Request, Response } from "express";
import authRoutes from "./routes/auth.route";
import holdingRoutes from "./routes/holdings.route";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

// Cookie parser to read cookies
app.use(cookieParser());

app.use(express.json());

// Cors will go here

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

app.use("/api/holdings", holdingRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
