import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Password reset token is missing from the URL.");
      toast.error("Missing reset token");
      return;
    }

    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword({ token, password });
      setIsSuccess(true);
      toast.success(res.message || "Password reset successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      const msg =
        error.response?.data?.message ||
        "Failed to reset password. The link may have expired.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
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
            Reset your password
          </h1>
          <p className="text-xs text-slate-500">
            Enter and confirm your new secure password.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/50">
          {isSuccess ? (
            <div className="text-center py-3 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Password Reset Complete!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Your password has been updated. Redirecting to Sign In...
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
                  <div>
                    <p>{errorMessage}</p>
                    <Link
                      to="/forgot-password"
                      className="mt-1 inline-block font-semibold text-rose-700 hover:underline"
                    >
                      Request a new reset link
                    </Link>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Cancel and return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
