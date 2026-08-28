const express = require("express");

const {
  createCodeSubmission,
  getMyCodeSubmissions,
  getAllCodeSubmissions,
  getCodeSubmissionById,
  getProjectCodeSubmissions,
  analyzeSubmissionById,
  analyzeProjectOverall,
  getLatestProjectAnalysis,
  getMyCodeFindings,
  getProjectCodeFindings,
  getMyManagerReviews,
  getMyManagerReviewById,
} = require("../controllers/codeController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Submit code (developer)
router.post("/", protect, createCodeSubmission);

// Get only logged-in developer's submissions
router.get("/my", protect, getMyCodeSubmissions);

// Get developer-specific actionable code findings (developer dashboard)
router.get("/my-findings", protect, getMyCodeFindings);

// Get developer-specific Manager AI Reviews
router.get("/my-manager-reviews", protect, getMyManagerReviews);

// Get single Manager AI Review detail for developer
router.get("/my-manager-reviews/:analysisId", protect, getMyManagerReviewById);

// Get all developer submissions (manager only)
router.get("/all", protect, getAllCodeSubmissions);

// Get all submissions for a project (manager)
router.get("/project/:projectId", protect, getProjectCodeSubmissions);

// Get project findings for manager
router.get("/project/:projectId/findings", protect, getProjectCodeFindings);

// Generate overall project AI analysis (manager)
router.post("/project/:projectId/ai-insights", protect, analyzeProjectOverall);

// Get latest overall project AI analysis (manager)
router.get("/project/:projectId/ai-insights", protect, getLatestProjectAnalysis);

// Re-analyze individual submission
router.post("/:id/analyze", protect, analyzeSubmissionById);

// Get individual code submission by ID
router.get("/:id", protect, getCodeSubmissionById);

module.exports = router;