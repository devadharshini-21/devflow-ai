const express = require("express");

const {
  createTask,
  getMyTasks,
  getAllTasks,
  getProjectTasks,
  updateTaskStatus,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a task
router.post("/", protect, createTask);

// Get tasks assigned to logged-in user
router.get("/my", protect, getMyTasks);

// Get all tasks (for manager / managed projects)
router.get("/all", protect, getAllTasks);

// Get all tasks for a project
router.get("/project/:projectId", protect, getProjectTasks);

// Update task status
router.patch("/:taskId/status", protect, updateTaskStatus);

module.exports = router;