import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BriefcaseBusiness,
  Code2,
  Server,
  Palette,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  registerUser,
  resendVerification,
} from "../services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [resending, setResending] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectRole = (role) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!formData.password) {
      toast.error("Please enter a password");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!formData.role) {
      toast.error("Please choose your role");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser(formData);
      setRegisteredEmail(formData.email.trim());
      setIsRegistered(true);

      toast.success(
        response.message || "Registration successful! Please verify your email."
      );
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;

    try {
      setResending(true);
      const res = await resendVerification(registeredEmail);
      toast.success(res.message || "Verification link sent to your email!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to resend verification link."
      );
    } finally {
      setResending(false);
    }
  };

  const roles = [
    {
      name: "Project Manager",
      description: "Manage projects, tasks and team progress",
      icon: BriefcaseBusiness,
    },
    {
      name: "Frontend Developer",
      description: "Build user interfaces and client features",
      icon: Code2,
    },
    {
      name: "Backend Developer",
      description: "Develop APIs, databases and business logic",
      icon: Server,
    },
    {
      name: "UI/UX Designer",
      description: "Design mockups, wireframes and user experience",
      icon: Palette,
    },
    {
      name: "QA Tester",
      description: "Test functionality, report bugs and verify quality",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center px-6 py-12">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute left-1/2 -top-24 h-96 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl" />

      <div className="relative w-full max-w-3xl page-enter">
        {/* Logo */}
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-bold text-white shadow-sm shadow-indigo-600/20">
            D
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            DevFlow <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* If successfully registered, show verification instructions */}
        {isRegistered ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-lg shadow-slate-200/50 text-center max-w-xl mx-auto space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Mail size={32} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Verify your email address
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                We&apos;ve sent a confirmation link to{" "}
                <strong className="text-indigo-600 font-semibold">{registeredEmail}</strong>.
                Please check your inbox to activate your account.
              </p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-indigo-900 flex items-start gap-2.5 text-left">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-indigo-600" />
              <span>
                The verification link is valid for <strong>24 hours</strong>. Once verified, sign in to access your role workspace.
              </span>
            </div>

            <div className="pt-2 space-y-3">
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 hover:-translate-y-0.5"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight size={15} />
              </Link>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50"
              >
                {resending ? "Resending Link..." : "Didn't receive the email? Resend link"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Heading */}
            <div className="mb-6 text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Create your account
              </h1>
              <p className="text-xs text-slate-500">
                Start collaborating with your team in one intelligent workspace.
              </p>
            </div>

            {/* Form Card */}
            <form onSubmit={handleRegister}>
              <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-lg shadow-slate-200/50 space-y-5">
                {/* Name + Email Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                        placeholder="e.g. Alex Chen"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Work Email <span className="text-rose-500">*</span>
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
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
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
                      autoComplete="new-password"
                      required
                      placeholder="Create a strong password (min. 6 characters)"
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

                {/* Role Selection */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Select Your Role <span className="text-rose-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {roles.map((roleItem) => {
                      const Icon = roleItem.icon;
                      const isSelected = formData.role === roleItem.name;

                      return (
                        <div
                          key={roleItem.name}
                          onClick={() => selectRole(roleItem.name)}
                          className={`cursor-pointer rounded-xl border p-3.5 transition-all duration-150 ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`rounded-lg p-2 ${
                                isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <Icon size={16} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-xs font-bold text-slate-900 truncate">
                                {roleItem.name}
                              </h3>
                              <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">
                                {roleItem.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </>
        )}

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