const express = require("express");

const { getTeamMembers } = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/team", protect, getTeamMembers);

module.exports = router;