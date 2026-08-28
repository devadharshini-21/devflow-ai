const mongoose = require("mongoose");

const codeSubmissionSchema = new mongoose.Schema(
  {
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    language: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
    },

    // AI analysis
    summary: {
      type: String,
      default: "",
    },

    errors: [
      {
        type: String,
      },
    ],

    warnings: [
      {
        type: String,
      },
    ],

    suggestions: [
      {
        type: String,
      },
    ],

    qualityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    aiAnalysis: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

module.exports =
  mongoose.models.CodeSubmission ||
  mongoose.model("CodeSubmission", codeSubmissionSchema);