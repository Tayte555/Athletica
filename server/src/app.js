import express from "express";
import cors from "cors";
import testRoutes from "./routes/test.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";
import routineRoutes from "./routes/routine.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/routines", routineRoutes);
app.use("/uploads", express.static("server/uploads"));

export default app;
