import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // ❗ ne jamais renvoyer le mot de passe
    },

    avatar: {
      type: String,
      default: "",
    },

    couple: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couple",
      default: null,
    },

    stats: {
      gamesPlayed: { type: Number, default: 0 },
      challengesDone: { type: Number, default: 0 },
      gamesTypes: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
