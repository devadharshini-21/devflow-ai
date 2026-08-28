import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetLink, setDevResetLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      setDevResetLink("");
      const res = await forgotPassword(email.trim());

      setSubmitted(true);

      if (res.development && res.resetLink) {
        setDevResetLink(res.resetLink);
        toast.success("Development reset link generated!", { duration: 5000 });
      } else {
        toast.success(res.message || "Reset link sent if account exists");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to send the password reset email right now. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!devResetLink) return;
    navigator.clipboard.writeText(devResetLink);
    setCopied(true);
    toast.success("Development reset link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
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
            Forgot password?
          </h1>
          <p className="text-xs text-slate-500">
            Enter your email to receive a secure password reset link.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/50">
          {submitted ? (
            <div className="text-center py-2 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {devResetLink ? "Reset Link Generated" : "Check your inbox"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {devResetLink ? (
                  <>Development fallback is active for <strong className="text-indigo-600 font-semibold">{email}</strong>.</>
                ) : (
                  <>If an account exists for <strong className="text-indigo-600 font-semibold">{email}</strong>, you will receive reset instructions shortly.</>
                )}
              </p>

              {/* Dev Link */}
              {devResetLink && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-left space-y-2.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                    <Terminal size={13} />
                    <span>Dev Environment Fallback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={devResetLink}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 py-2 px-3 text-xs font-bold text-white hover:bg-amber-600 transition shadow-xs"
                    >
                      <span>Open Reset Link</span>
                      <ExternalLink size={13} />
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      title="Copy link"
                      className="rounded-lg border border-amber-300 bg-white p-2 text-amber-800 hover:bg-amber-100 transition"
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 text-left flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-slate-400" />
                <span>The reset token is valid for <strong>15 minutes</strong> and can only be used once.</span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setDevResetLink("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Send another link
                </button>
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                >
                  <ArrowLeft size={14} /> Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Back Link */}
        <Link
          to="/"
          className="mt-4 block text-center text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
