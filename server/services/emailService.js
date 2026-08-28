require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const nodemailer = require("nodemailer");

/**
 * Check whether email configuration is provided in environment variables
 */
const isEmailConfigured = () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  const service = process.env.EMAIL_SERVICE;

  return Boolean((host || service) && user && rawPass);
};

/**
 * Create reusable transporter
 */
const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn(
      "⚠️ [SMTP Config Notice] Email service is not fully configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASSWORD in server/.env."
    );
    return null;
  }

  const host = (process.env.EMAIL_HOST || "").trim();
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || "").trim().replace(/\s+/g, "");
  const service = (process.env.EMAIL_SERVICE || "").trim();

  // If Gmail is configured via service or host
  if (service.toLowerCase() === "gmail" || host.toLowerCase() === "smtp.gmail.com") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const secure = port === 465;

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Get safe sender address
 */
const getSenderAddress = () => {
  const customFrom = process.env.EMAIL_FROM;
  const userEmail = process.env.EMAIL_USER;

  if (customFrom && customFrom.includes("@") && !customFrom.includes("no-reply@devflow.ai")) {
    return customFrom;
  }

  if (userEmail) {
    return `"DevFlow AI" <${userEmail}>`;
  }

  return '"DevFlow AI" <no-reply@devflow.ai>';
};

/**
 * Common HTML email shell for DevFlow AI
 */
const getEmailTemplate = ({ title, preheader, contentHtml }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #07111F;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #07111F;
      padding: 40px 16px;
    }
    .main {
      background-color: #0F172A;
      margin: 0 auto;
      width: 100%;
      max-width: 580px;
      border-radius: 16px;
      border: 1px solid #1E293B;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      padding: 32px 32px 28px;
      text-align: center;
    }
    .logo-badge {
      display: inline-block;
      width: 44px;
      height: 44px;
      line-height: 44px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 12px;
    }
    .logo-text {
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .logo-sub {
      color: #C7D2FE;
    }
    .content {
      padding: 36px 32px;
    }
    h1 {
      color: #F8FAFC;
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 16px 0;
    }
    p {
      color: #94A3B8;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background: #4F46E5;
      color: #FFFFFF !important;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.4);
    }
    .btn:hover {
      background: #4338CA;
    }
    .link-alt {
      background-color: #07111F;
      border: 1px solid #1E293B;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
      color: #818CF8;
      word-break: break-all;
      margin-top: 20px;
    }
    .footer {
      border-top: 1px solid #1E293B;
      padding: 24px 32px;
      text-align: center;
      background-color: #0A0F1D;
    }
    .footer p {
      color: #64748B;
      font-size: 12px;
      margin: 0;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
  <table class="wrapper" role="presentation">
    <tr>
      <td align="center">
        <table class="main" role="presentation">
          <tr>
            <td class="header">
              <div class="logo-badge">D</div>
              <h2 class="logo-text">DevFlow <span class="logo-sub">AI</span></h2>
            </td>
          </tr>
          <tr>
            <td class="content">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>© ${new Date().getFullYear()} DevFlow AI — Intelligent Software Workspace. All rights reserved.</p>
              <p style="margin-top: 4px;">This is an automated message, please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Send Email Verification link
 */
const sendVerificationEmail = async ({ email, name, token }) => {
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").trim().replace(/\/$/, "");
  const verificationLink = `${clientUrl}/verify-email/${token}`;
  const sender = getSenderAddress();

  const contentHtml = `
    <h1>Verify your email address</h1>
    <p>Hi <strong>${name || "there"}</strong>,</p>
    <p>Thank you for registering with DevFlow AI. Please confirm your email address to activate your account and access your team workspace.</p>
    <div class="btn-container">
      <a href="${verificationLink}" class="btn" target="_blank">Verify Email Address</a>
    </div>
    <p>This verification link will expire in <strong>24 hours</strong>. If you didn't create an account on DevFlow AI, you can safely ignore this email.</p>
    <p style="font-size: 13px; color: #64748B; margin-bottom: 8px;">If the button above doesn't work, copy and paste the link below into your browser:</p>
    <div class="link-alt">${verificationLink}</div>
  `;

  const html = getEmailTemplate({
    title: "Verify your DevFlow AI account",
    preheader: "Verify your email address to access your DevFlow AI workspace",
    contentHtml,
  });

  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      `⚠️ [EMAIL NOT SENT - SMTP NOT CONFIGURED] Verification link for ${email}: ${verificationLink}`
    );
    return {
      success: false,
      message: "Email provider is not configured.",
      link: verificationLink,
    };
  }

  const mailOptions = {
    from: sender,
    to: email,
    subject: "Verify your DevFlow AI Account",
    text: `Hi ${name},\n\nPlease verify your DevFlow AI account by clicking this link:\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nBest regards,\nDevFlow AI Team`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email successfully sent to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ SMTP send error to ${email}:`, error.message);
    throw error;
  }
};

/**
 * Send Password Reset link
 */
const sendPasswordResetEmail = async ({ email, name, token }) => {
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").trim().replace(/\/$/, "");
  const resetLink = `${clientUrl}/reset-password/${token}`;
  const sender = getSenderAddress();

  const contentHtml = `
    <h1>Password Reset Request</h1>
    <p>Hi <strong>${name || "there"}</strong>,</p>
    <p>We received a request to reset the password for your DevFlow AI account. Click the button below to choose a new password.</p>
    <div class="btn-container">
      <a href="${resetLink}" class="btn" target="_blank">Reset Password</a>
    </div>
    <p>This password reset link will expire in <strong>15 minutes</strong>.</p>
    <p style="font-size: 13px; color: #EF4444; font-weight: 500;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
    <p style="font-size: 13px; color: #64748B; margin-bottom: 8px; margin-top: 24px;">If the button above doesn't work, copy and paste this link into your browser:</p>
    <div class="link-alt">${resetLink}</div>
  `;

  const html = getEmailTemplate({
    title: "Reset your DevFlow AI Password",
    preheader: "Reset instructions for your DevFlow AI account password",
    contentHtml,
  });

  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      `⚠️ [EMAIL NOT SENT - SMTP NOT CONFIGURED] Password reset link for ${email}: ${resetLink}`
    );
    return {
      success: false,
      message: "Email provider is not configured.",
      link: resetLink,
    };
  }

  const mailOptions = {
    from: sender,
    to: email,
    subject: "Reset your DevFlow AI Password",
    text: `Hi ${name},\n\nYou requested to reset your password. Use the following link to set a new password:\n${resetLink}\n\nThis link is valid for 15 minutes.\n\nIf you did not make this request, you can ignore this email.\n\nDevFlow AI Team`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Password reset email successfully sent to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ SMTP send error to ${email}:`, error.message);
    throw error;
  }
};

module.exports = {
  isEmailConfigured,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
