const jwt = require("jsonwebtoken");
const {
  registerUser,
  loginUser,
  verifyEmailToken,
  resendVerificationToken,
  requestPasswordReset,
  resetPassword,
} = require("../services/authService");

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ==========================================
// 1. REGISTER
// ==========================================
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const { user, verificationToken } = await registerUser({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message:
        "Registration successful! We have sent a verification link to your email address. Please verify your account to log in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// ==========================================
// 2. LOGIN
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser({ email, password });
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    if (error.isUnverified) {
      return res.status(403).json({
        success: false,
        isUnverified: true,
        email: error.email,
        message: error.message,
      });
    }

    res.status(401).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
};

// ==========================================
// 3. VERIFY EMAIL
// ==========================================
const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token || req.body.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const user = await verifyEmailToken(token);
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now access your workspace.",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Email Verification Error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Email verification failed",
      isExpired: Boolean(error.isExpired),
    });
  }
};

// ==========================================
// 4. RESEND VERIFICATION EMAIL
// ==========================================
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await resendVerificationToken(email);

    res.status(200).json(result);
  } catch (error) {
    console.error("Resend Verification Error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to resend verification link",
    });
  }
};

// ==========================================
// 5. FORGOT PASSWORD
// ==========================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email);

    if (!result.success) {
      return res.status(503).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to send the password reset email right now. Please try again later.",
    });
  }
};

// ==========================================
// 6. RESET PASSWORD
// ==========================================
const resetPasswordHandler = async (req, res) => {
  try {
    const { token, password } = req.body;
    await resetPassword({ token, password });

    res.status(200).json({
      success: true,
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to reset password",
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword: resetPasswordHandler,
};