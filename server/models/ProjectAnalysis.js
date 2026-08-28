const mongoose = require("mongoose");

const projectAnalysisSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    overallQualityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    healthStatus: {
      type: String,
      enum: ["Excellent", "Good", "Needs Improvement", "Critical"],
      default: "Good",
    },

    summary: {
      type: String,
      required: true,
    },

    commonIssues: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        affectedCount: { type: Number, default: 1 },
        severity: {
          type: String,
          enum: ["Low", "Medium", "High", "Critical"],
          default: "Medium",
        },
      },
    ],

    securityConcerns: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        severity: {
          type: String,
          enum: ["Low", "Medium", "High", "Critical"],
          default: "High",
        },
      },
    ],

    maintainabilityConcerns: [
      {
        type: String,
      },
    ],

    developerInsights: [
      {
        developerName: { type: String, required: true },
        role: { type: String, default: "Developer" },
        filesSubmitted: { type: Number, default: 0 },
        averageQualityScore: { type: Number, default: 0 },
        criticalIssues: { type: Number, default: 0 },
        commonIssues: [{ type: String }],
        status: { type: String, default: "Active" },
      },
    ],

    strongAreas: [
      {
        type: String,
      },
    ],

    recommendations: [
      {
        type: String,
      },
    ],

    submissionsAnalyzedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.ProjectAnalysis ||
  mongoose.model("ProjectAnalysis", projectAnalysisSchema);
