import api from "./api";

/**
 * Normal Email / Password Registration
 */
export const registerUser = async ({ name, email, password, role }) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
    role,
  });
  return response.data;
};

/**
 * Normal Email / Password Login
 */
export const loginUser = async ({ email, password }) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

/**
 * Verify Email with Token
 */
export const verifyEmail = async (token) => {
  const response = await api.post("/auth/verify-email", { token });
  return response.data;
};

/**
 * Resend Email Verification Link
 */
export const resendVerification = async (email) => {
  const response = await api.post("/auth/resend-verification", { email });
  return response.data;
};

/**
 * Request Password Reset Link
 */
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

/**
 * Reset Password with Token
 */
export const resetPassword = async ({ token, password }) => {
  const response = await api.post("/auth/reset-password", {
    token,
    password,
  });
  return response.data;
};

/**
 * Save authentication payload to localStorage
 */
export const saveAuthData = (token, user) => {
  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Get current stored user
 */
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Get role-based dashboard path
 */
export const getDashboardPathForRole = (role) => {
  switch (role) {
    case "Project Manager":
      return "/dashboard/project-manager";
    case "Frontend Developer":
      return "/dashboard/frontend";
    case "Backend Developer":
      return "/dashboard/backend";
    case "UI/UX Designer":
      return "/dashboard/uiux";
    case "QA Tester":
      return "/dashboard/qa";
    default:
      return "/dashboard";
  }
};
