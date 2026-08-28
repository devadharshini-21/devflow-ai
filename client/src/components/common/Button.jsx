import { Loader2 } from "lucide-react";

const Button = ({
  children,
  type = "button",
  onClick,
  className = "",
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  icon: Icon,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-sm";
      case "ai":
        return "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-sm shadow-indigo-600/20";
      case "danger":
        return "bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-600/20";
      case "ghost":
        return "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900";
      case "outline":
        return "bg-transparent text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300";
      case "primary":
      default:
        return "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/20";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-xs rounded-lg gap-1.5";
      case "lg":
        return "px-6 py-3.5 text-base rounded-xl gap-2.5";
      case "md":
      default:
        return "px-4 py-2.5 text-sm rounded-xl gap-2";
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-150 ease-out
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]
        disabled:opacity-50 disabled:pointer-events-none disabled:transform-none
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;