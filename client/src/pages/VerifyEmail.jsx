import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Mail, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { verifyEmail, resendVerification } from "../services/authService";

export default function VerifyEmail() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  // Resend state
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (!token) {
        if (isMounted) {
          setLoading(false);
          setSuccess(false);
          setErrorMessage("No verification token found in URL.");
        }
        return;
      }

      try {
        setLoading(true);
        const res = await verifyEmail(token);
        if (isMounted) {
          setSuccess(true);
          toast.success(res.message || "Email verified successfully!");
        }
      } catch (error) {
        if (isMounted) {
          setSuccess(false);
          const msg =
            error.response?.data?.message ||
            "The verification link is invalid or has expired.";
          setErrorMessage(msg);
          setIsExpired(Boolean(error.response?.data?.isExpired));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.error("Please enter your email to resend verification link");
      return;
    }

    try {
      setResending(true);
      const res = await resendVerification(resendEmail.trim());
      setResendDone(true);
      toast.success(res.message || "Verification link resent!");
    } catch (error) {
      console.error("Resend error:", error);
      toast.error(
        error.response?.data?.message || "Failed to resend verification email."
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

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-lg shadow-slate-200/50">
          {loading ? (
            <div className="text-center py-8 space-y-3">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Verifying your email...
              </h2>
              <p className="text-xs text-slate-500">
                Please wait while we activate your account.
              </p>
            </div>
          ) : success ? (
            <div className="text-center py-2 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">
                  Email Verified Successfully!
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Your email has been verified. You can now sign in to your workspace.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-500 transition"
                >
                  <span>Sign In Now</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-2 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertTriangle size={30} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">
                  Verification Failed
                </h2>
                <p className="text-xs text-rose-600 leading-relaxed max-w-xs mx-auto">
                  {errorMessage || "The verification link is invalid or expired."}
                </p>
              </div>

              {/* Resend Form if Expired */}
              <div className="pt-2">
                {resendDone ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 text-left">
                    <p className="font-semibold">Verification link sent!</p>
                    <p className="mt-0.5 text-emerald-700 text-[11px]">
                      Please check your inbox for the fresh activation link.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleResend} className="space-y-3 text-left">
                    <p className="text-xs font-semibold text-slate-700">
                      Request a new activation link:
                    </p>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resending}
                      className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition disabled:opacity-60"
                    >
                      {resending ? "Sending..." : "Resend Verification Link"}
                    </button>
                  </form>
                )}
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
