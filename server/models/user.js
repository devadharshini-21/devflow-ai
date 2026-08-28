const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId && this.authProvider !== "google";
      },
      minlength: 6,
    },

    role: {
      type: String,
      enum: [
        "Project Manager",
        "Frontend Developer",
        "Backend Developer",
        "UI/UX Designer",
        "QA Tester",
      ],
      required: [true, "Role is required"],
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationTokenHash: {
      type: String,
    },

    emailVerificationExpires: {
      type: Date,
    },

    passwordResetTokenHash: {
      type: String,
    },

    passwordResetExpires: {
      type: Date,
    },

    googleId: {
      type: String,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);