import { Loader2 } from "lucide-react";

export default function Loader({ text = "Loading...", size = "md", fullPage = false }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className={`animate-spin text-indigo-600 ${sizeClasses[size] || sizeClasses.md}`} />
      {text && <p className="mt-3 text-xs font-medium text-slate-500">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
