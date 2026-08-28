const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Standard Authentication
router.post("/register", register);
router.post("/login", login);

// Email Verification
router.post("/verify-email", verifyEmail);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

// Password Management
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;