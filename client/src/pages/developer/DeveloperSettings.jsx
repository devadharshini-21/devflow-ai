import { useState } from "react";
import { User, Mail, Shield, Bell, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function DeveloperSettings() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "Frontend Developer";

  const [notifications, setNotifications] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Profile preferences saved");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 page-enter">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white px-8 py-5">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600">
            {role} Workspace
          </p>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Account &amp; Developer Preferences
          </h1>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Developer Profile
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user.name || "Developer"}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={user.email || ""}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Assigned Role
              </label>
              <div className="inline-block rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {role}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Notification Preferences
            </h2>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div>
              <p className="text-xs font-bold text-slate-900">
                Manager AI Review &amp; Remediation Alerts
              </p>
              <p className="text-[11px] text-slate-500">
                Notify when project manager runs project audits containing feedback for your files.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </main>
    </div>
  );
}