import { useEffect, useState } from "react";
import { Users, Mail, Loader2, ShieldCheck, Code2, Palette, Server } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function ManagerTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const response = await api.get("/users/team");
        setTeam(response.data.users || response.data.team || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load team"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case "Frontend Developer":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Backend Developer":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "UI/UX Designer":
        return "bg-pink-50 text-pink-700 border-pink-200";
      case "QA Tester":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 page-enter">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white px-8 py-5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600">
              Project Manager
            </p>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Development Team Directory
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            {team.length} Engineers &amp; Designers
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Team Members
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Engineers, designers, and quality assurance specialists available for project assignment.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs text-slate-500">Loading team members...</p>
          </div>
        ) : team.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Users className="mx-auto mb-3 text-slate-400" size={36} />
            <h3 className="text-base font-bold text-slate-900">No team members registered yet</h3>
            <p className="mt-1 text-xs text-slate-500">
              When developers register with their roles, they will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div
                key={member._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-extrabold text-indigo-700 text-sm">
                    {(member.name || "U")[0].toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {member.name}
                    </h3>
                    <span
                      className={`inline-block mt-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${getRoleBadge(
                        member.role
                      )}`}
                    >
                      {member.role || "Developer"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition truncate"
                  >
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}