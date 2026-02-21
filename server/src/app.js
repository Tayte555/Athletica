import express from "express";
import cors from "cors";
import testRoutes from "./routes/test.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);

export default app;
