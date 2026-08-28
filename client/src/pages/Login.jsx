import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  loginUser,
  resendVerification,
  saveAuthData,
  getDashboardPathForRole,
} from "../services/authService";
import { getTimeGreeting } from "../utils/greeting";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleRedirect = (role) => {
    const targetPath = getDashboardPathForRole(role);
    navigate(targetPath, { replace: true });
  };

  // Normal Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setUnverifiedEmail("");

    if (!formData.email || !formData.password) {
      toast.error("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(formData);
      const { token, user } = response;

      saveAuthData(token, user);
      toast.success(`${getTimeGreeting()}, ${user.name}!`);

      handleRoleRedirect(user.role);
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.isUnverified) {
        setUnverifiedEmail(error.response.data.email || formData.email);
        toast.error(
          error.response.data.message || "Please verify your email address first."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Login failed. Please check your credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend verification link
  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    try {
      setResending(true);
      const res = await resendVerification(unverifiedEmail);
      toast.success(res.message || "Verification link sent to your email!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to resend verification link."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center px-6 py-12">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute left-1/2 -top-24 h-96 w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative w-full max-w-md page-enter">
        {/* Logo */}
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-bold text-white shadow-sm shadow-indigo-600/20">
            D
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            DevFlow <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* Heading */}
        <div className="mb-6 text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs text-slate-500">
            Continue building better software with your team.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/50">
          {/* Unverified Email Warning Banner */}
          {unverifiedEmail && (
            <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={17} className="shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-1.5 flex-1">
                  <p className="font-bold text-amber-900">
                    Email verification required
                  </p>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    Your account email ({unverifiedEmail}) has not been verified yet.
                  </p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="inline-block rounded-lg bg-amber-200 px-3 py-1 font-semibold text-amber-900 hover:bg-amber-300 transition text-[11px] disabled:opacity-50"
                  >
                    {resending ? "Sending link..." : "Resend Verification Link"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Work Email
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Back Link */}
        <Link
          to="/"
          className="mt-5 block text-center text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}