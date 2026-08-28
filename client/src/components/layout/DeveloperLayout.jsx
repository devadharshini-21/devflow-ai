import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  MessageSquare,
  Bot,
  Sparkles,
  Settings,
  LogOut,
  Users,
  Code,
} from "lucide-react";

export default function DeveloperLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "Frontend Developer";

  // Determine the correct dashboard base path
  let basePath = "/dashboard/developer";
  if (location.pathname.startsWith("/dashboard/frontend")) {
    basePath = "/dashboard/frontend";
  } else if (location.pathname.startsWith("/dashboard/backend")) {
    basePath = "/dashboard/backend";
  } else if (location.pathname.startsWith("/dashboard/uiux")) {
    basePath = "/dashboard/uiux";
  } else if (location.pathname.startsWith("/dashboard/qa")) {
    basePath = "/dashboard/qa";
  } else if (location.pathname.startsWith("/dashboard/developer")) {
    basePath = "/dashboard/developer";
  } else {
    if (role === "Backend Developer") basePath = "/dashboard/backend";
    else if (role === "UI/UX Designer") basePath = "/dashboard/uiux";
    else if (role === "QA Tester") basePath = "/dashboard/qa";
    else basePath = "/dashboard/developer";
  }

  const firstName = user.name ? user.name.split(" ")[0] : "Developer";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    {
      name: "Overview",
      path: basePath,
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "My Tasks",
      path: `${basePath}/tasks`,
      icon: CheckSquare,
    },
    {
      name: "My Projects",
      path: `${basePath}/projects`,
      icon: FolderKanban,
    },
    {
      name: "Team",
      path: `${basePath}/team`,
      icon: Users,
    },
    {
      name: "Group Chat",
      path: `${basePath}/chat`,
      icon: MessageSquare,
    },
    {
      name: "AI Code Studio",
      path: `${basePath}/ai-code`,
      icon: Bot,
    },
    {
      name: "Manager AI Reviews",
      path: `${basePath}/manager-reviews`,
      icon: Sparkles,
    },
    {
      name: "Settings",
      path: `${basePath}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex">
      {/* ================================================
          SIDEBAR
      ================================================= */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-xs">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 font-bold text-white shadow-sm shadow-indigo-600/20 text-sm">
              D
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                DevFlow <span className="text-indigo-600">AI</span>
              </p>
              <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">
                Developer Studio
              </p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="shrink-0 border-b border-slate-100 px-5 py-3.5 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800 font-extrabold text-xs shadow-2xs">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">
                {user.name || "Developer"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate">
                <Code size={11} className="text-cyan-600 shrink-0" />
                <span className="truncate">{role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200/60 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={17} className="shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-slate-100 p-3.5 bg-white">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================================================
          MAIN CONTENT WRAPPER
      ================================================= */}
      <div className="ml-64 flex-1 min-h-screen bg-[#F8FAFC]">
        <Outlet />
      </div>
    </div>
  );
}