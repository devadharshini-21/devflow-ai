const mongoose = require("mongoose");

const developerCodeFindingSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    codeSubmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodeSubmission",
    },

    projectAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectAnalysis",
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    language: {
      type: String,
      default: "javascript",
      trim: true,
    },

    severity: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"],
      default: "MEDIUM",
      index: true,
    },

    category: {
      type: String,
      default: "Code Quality",
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    lineNumber: {
      type: String,
      default: "Unable to determine exact line",
    },

    codeSnippet: {
      type: String,
      default: "",
    },

    problem: {
      type: String,
      default: "",
    },

    whyItMatters: {
      type: String,
      default: "",
    },

    recommendedFix: {
      type: String,
      default: "",
    },

    suggestedCode: {
      type: String,
      default: "",
    },

    developerAction: {
      type: String,
      default: "",
    },

    analyzedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    source: {
      type: String,
      enum: ["individual", "project_analysis"],
      default: "individual",
    },

    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.DeveloperCodeFinding ||
  mongoose.model("DeveloperCodeFinding", developerCodeFindingSchema);
