import express from "express";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome to your dashboard, user ${req.userId}` });
});

export default router;
