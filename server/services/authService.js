const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("./emailService");

const ALLOWED_ROLES = [
  "Project Manager",
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "QA Tester",
];

// Helper: validate email syntax
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === "string" && emailRegex.test(email.trim());
};

// Helper: SHA-256 hash
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Helper: Generate crypto random token
const generateCryptoToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// ==========================================
// 1. REGISTER USER
// ==========================================
const registerUser = async ({ name, email, password, role }) => {
  if (!name || !name.trim()) {
    throw new Error("Name is required");
  }

  if (!email || !isValidEmail(email)) {
    throw new Error("A valid email address is required");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  if (!role || !ALLOWED_ROLES.includes(role)) {
    throw new Error(
      `Invalid role. Must be one of: ${ALLOWED_ROLES.join(", ")}`
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new Error("User already exists with this email address");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate email verification token (32 bytes = 64 hex chars)
  const rawVerificationToken = generateCryptoToken();
  const tokenHash = hashToken(rawVerificationToken);
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    emailVerified: false,
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: tokenExpiry,
    authProvider: "local",
  });

  // Attempt to send verification email
  try {
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: rawVerificationToken,
    });
  } catch (emailErr) {
    console.error("Failed to send verification email on registration:", emailErr.message);
  }

  return {
    user,
    verificationToken: rawVerificationToken,
  };
};

// ==========================================
// 2. LOGIN USER
// ==========================================
const loginUser = async ({ email, password }) => {
  if (!email || !isValidEmail(email)) {
    throw new Error("Please enter a valid email address");
  }

  if (!password) {
    throw new Error("Please enter your password");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.password) {
    throw new Error("Please contact your administrator to set your password.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Check email verification status
  if (user.emailVerified === false) {
    const error = new Error(
      "Please verify your email address before logging in. Check your inbox for the verification link."
    );
    error.isUnverified = true;
    error.email = user.email;
    throw error;
  }

  return user;
};

// ==========================================
// 3. VERIFY EMAIL TOKEN
// ==========================================
const verifyEmailToken = async (rawToken) => {
  if (!rawToken || typeof rawToken !== "string") {
    throw new Error("Verification token is missing or invalid");
  }

  const tokenHash = hashToken(rawToken.trim());

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    // Check if token existed but expired
    const expiredUser = await User.findOne({
      emailVerificationTokenHash: tokenHash,
    });

    if (expiredUser) {
      const err = new Error(
        "Verification link has expired. Please request a new verification email."
      );
      err.isExpired = true;
      throw err;
    }

    throw new Error("Invalid or expired verification link");
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  return user;
};

// ==========================================
// 4. RESEND VERIFICATION EMAIL
// ==========================================
const resendVerificationToken = async (email) => {
  if (!email || !isValidEmail(email)) {
    return {
      success: true,
      message:
        "If an unverified account exists with that email address, a verification link has been sent.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (user && !user.emailVerified) {
    const rawVerificationToken = generateCryptoToken();
    user.emailVerificationTokenHash = hashToken(rawVerificationToken);
    user.emailVerificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await user.save();

    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        token: rawVerificationToken,
      });
    } catch (emailErr) {
      console.error("Failed to send verification email on resend:", emailErr.message);
    }
  }

  return {
    success: true,
    message:
      "If an unverified account exists with that email address, a verification link has been sent.",
  };
};

// ==========================================
// 5. REQUEST PASSWORD RESET
// ==========================================
const requestPasswordReset = async (email) => {
  if (!email || !isValidEmail(email)) {
    return {
      success: true,
      message:
        "If an account with that email exists and is verified, a password reset link has been sent.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isDevMode =
    process.env.PASSWORD_RESET_EMAIL_MODE === "development" &&
    process.env.NODE_ENV !== "production";

  console.log(`[FORGOT PASSWORD] Request received`);
  console.log(`[FORGOT PASSWORD] Mode: ${isDevMode ? "DEVELOPMENT FALLBACK" : "SMTP EMAIL"}`);
  console.log(`[FORGOT PASSWORD] MongoDB lookup started`);

  let user;
  try {
    user = await User.findOne({ email: normalizedEmail });
    console.log(`[FORGOT PASSWORD] MongoDB lookup completed (user found: ${Boolean(user)})`);
  } catch (dbErr) {
    console.error(`[FORGOT PASSWORD] FAILED: MongoDB lookup error:`, dbErr.message);
    throw dbErr;
  }

  // Only allow password reset for accounts with a verified email
  if (user && user.emailVerified) {
    console.log(`[FORGOT PASSWORD] Reset token generated`);
    const rawResetToken = generateCryptoToken();
    user.passwordResetTokenHash = hashToken(rawResetToken);
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log(`[FORGOT PASSWORD] Saving reset token hash to MongoDB`);
    try {
      await user.save();
      console.log(`[FORGOT PASSWORD] Reset token saved to MongoDB`);
    } catch (saveErr) {
      console.error(`[FORGOT PASSWORD] FAILED: MongoDB save error:`, saveErr.message);
      throw saveErr;
    }

    // DEVELOPMENT FALLBACK MODE
    if (isDevMode) {
      const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").trim().replace(/\/$/, "");
      const resetLink = `${clientUrl}/reset-password/${rawResetToken}`;

      console.log(`[FORGOT PASSWORD] Development reset link generated successfully`);
      return {
        success: true,
        message: "Password reset link generated in development mode.",
        development: true,
        resetLink,
      };
    }

    // SMTP LIVE DELIVERY MODE
    try {
      console.log(`[FORGOT PASSWORD] Email send started via Nodemailer/SMTP`);
      const emailResult = await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        token: rawResetToken,
      });

      if (!emailResult.success) {
        console.warn(`[FORGOT PASSWORD] SMTP delivery unavailable: ${emailResult.message}`);
        return {
          success: false,
          message: "Unable to send the password reset email right now. Please try again later.",
        };
      }

      console.log(`[FORGOT PASSWORD] Email send completed: Delivered to SMTP`);
      return {
        success: true,
        message: "Password reset link sent. Please check your email.",
      };
    } catch (emailErr) {
      console.error(`[FORGOT PASSWORD] FAILED: SMTP send error:`, emailErr.message);
      return {
        success: false,
        message: "Unable to send the password reset email right now. Please try again later.",
      };
    }
  } else if (user && !user.emailVerified) {
    console.warn(`[FORGOT PASSWORD] Account exists but email is unverified`);
  } else {
    console.warn(`[FORGOT PASSWORD] No registered account found`);
  }

  // Anti-enumeration generic response
  if (isDevMode) {
    return {
      success: true,
      message:
        "If an account with that email exists and is verified, a password reset link has been generated in development mode.",
      development: true,
    };
  }

  return {
    success: true,
    message:
      "If an account with that email exists and is verified, a password reset link has been sent.",
  };
};

// ==========================================
// 6. RESET PASSWORD
// ==========================================
const resetPassword = async ({ token, password }) => {
  if (!token || typeof token !== "string") {
    throw new Error("Password reset token is missing or invalid");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const tokenHash = hashToken(token.trim());

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error(
      "Password reset link is invalid or has expired. Please request a new one."
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;

  // Ensure email is marked verified upon successful reset
  user.emailVerified = true;

  await user.save();

  return user;
};

module.exports = {
  ALLOWED_ROLES,
  registerUser,
  loginUser,
  verifyEmailToken,
  resendVerificationToken,
  requestPasswordReset,
  resetPassword,
};