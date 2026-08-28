const express = require("express");
const {
  getProjectMessages,
  sendProjectMessage,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:projectId", protect, getProjectMessages);
router.post("/:projectId", protect, sendProjectMessage);

module.exports = router;
