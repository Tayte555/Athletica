import mongoose from "mongoose";

const notificationPreferencesSchema = new mongoose.Schema(
  {
    followRequests: { type: Boolean, default: true },
    follows: { type: Boolean, default: true },
    followAccepted: { type: Boolean, default: true },
    routineCreated: { type: Boolean, default: true },
    likes: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    saves: { type: Boolean, default: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
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
    link: {
      type: String,
      default: "",
    },
    socialLinks: {
      type: Map,
      of: String,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
  },
  { timestamps: true, collection: "Users" },
);

export default mongoose.model("User", userSchema);
