import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Required profile fields
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Optional profile fields
    avatar: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    pronouns: {
      type: String,
      default: "",
    },
    socialLinks: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true, collection: "Users" },
);

export default mongoose.model("User", userSchema);
