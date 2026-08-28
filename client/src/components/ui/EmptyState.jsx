import { FolderKanban } from "lucide-react";
import Button from "../common/Button";

export default function EmptyState({
  icon: Icon = FolderKanban,
  title = "No items found",
  description = "Get started by creating your first item.",
  actionLabel,
  onAction,
  actionIcon,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} icon={actionIcon} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
