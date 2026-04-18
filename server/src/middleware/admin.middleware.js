import User from "../models/User.model.js";

export async function adminOnly(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("isAdmin isSuspended");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
