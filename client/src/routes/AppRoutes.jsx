import { Routes, Route } from "react-router-dom";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";

// =====================================================
// MANAGER PAGES
// =====================================================

import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ManagerProjects from "../pages/manager/ManagerProjects";
import ManagerTasks from "../pages/manager/ManagerTasks";
import ManagerTeam from "../pages/manager/ManagerTeam";
import ManagerChat from "../pages/manager/ManagerChat";
import ManagerAICode from "../pages/manager/ManagerAICode";
import ManagerSettings from "../pages/manager/ManagerSettings";

// =====================================================
// DEVELOPER PAGES
// =====================================================

import DeveloperDashboard from "../pages/developer/DeveloperDashboard";
import DeveloperTasks from "../pages/developer/DeveloperTasks";
import DeveloperProjects from "../pages/developer/DeveloperProjects";
import DeveloperTeam from "../pages/developer/DeveloperTeam";
import DeveloperChat from "../pages/developer/DeveloperChat";
import DeveloperAICode from "../pages/developer/DeveloperAICode";
import DeveloperManagerReviews from "../pages/developer/DeveloperManagerReviews";
import DeveloperSettings from "../pages/developer/DeveloperSettings";

// =====================================================
// LAYOUTS
// =====================================================

import ManagerLayout from "../components/layout/ManagerLayout";
import DeveloperLayout from "../components/layout/DeveloperLayout";

// =====================================================
// PROTECTION
// =====================================================

import ProtectedRoute from "./ProtectedRoute";


export default function AppRoutes() {

  return (

    <Routes>

      {/* =================================================
          PUBLIC ROUTES
      ================================================= */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      <Route
        path="/reset-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/verify-email/:token"
        element={<VerifyEmail />}
      />

      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />


      {/* =================================================
          PROJECT MANAGER
      ================================================= */}

      <Route
        path="/dashboard/project-manager"
        element={
          <ProtectedRoute
            allowedRoles={["Project Manager"]}
          >
            <ManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="projects" element={<ManagerProjects />} />
        <Route path="tasks" element={<ManagerTasks />} />
        <Route path="team" element={<ManagerTeam />} />
        <Route path="chat" element={<ManagerChat />} />
        <Route path="group-chat" element={<ManagerChat />} />
        <Route path="ai-code" element={<ManagerAICode />} />
        <Route path="ai-insights" element={<ManagerAICode />} />
        <Route path="settings" element={<ManagerSettings />} />
      </Route>


      {/* =================================================
          DEVELOPER (ALL DEVELOPER ROLES)
      ================================================= */}

      <Route
        path="/dashboard/developer"
        element={
          <ProtectedRoute
            allowedRoles={[
              "Frontend Developer",
              "Backend Developer",
              "UI/UX Designer",
              "QA Tester",
            ]}
          >
            <DeveloperLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DeveloperDashboard />} />
        <Route path="tasks" element={<DeveloperTasks />} />
        <Route path="my-tasks" element={<DeveloperTasks />} />
        <Route path="projects" element={<DeveloperProjects />} />
        <Route path="my-projects" element={<DeveloperProjects />} />
        <Route path="team" element={<DeveloperTeam />} />
        <Route path="chat" element={<DeveloperChat />} />
        <Route path="group-chat" element={<DeveloperChat />} />
        <Route path="ai-code" element={<DeveloperAICode />} />
        <Route path="manager-reviews" element={<DeveloperManagerReviews />} />
        <Route path="settings" element={<DeveloperSettings />} />
      </Route>


      {/* =================================================
          FRONTEND DEVELOPER
      ================================================= */}

      <Route
        path="/dashboard/frontend"
        element={
          <ProtectedRoute
            allowedRoles={["Frontend Developer"]}
          >
            <DeveloperLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}

        <Route
          index
          element={<DeveloperDashboard />}
        />

        {/* My Tasks */}

        <Route
          path="tasks"
          element={<DeveloperTasks />}
        />

        {/* My Projects */}

        <Route
          path="projects"
          element={<DeveloperProjects />}
        />

        {/* Team */}

        <Route
          path="team"
          element={<DeveloperTeam />}
        />

        {/* Group Chat */}

        <Route
          path="chat"
          element={<DeveloperChat />}
        />

        {/* AI Code */}

        <Route
          path="ai-code"
          element={<DeveloperAICode />}
        />

        {/* Manager AI Reviews */}

        <Route
          path="manager-reviews"
          element={<DeveloperManagerReviews />}
        />

        {/* Settings */}

        <Route
          path="settings"
          element={<DeveloperSettings />}
        />

      </Route>


      {/* =================================================
          BACKEND DEVELOPER
      ================================================= */}

      <Route
        path="/dashboard/backend"
        element={
          <ProtectedRoute
            allowedRoles={["Backend Developer"]}
          >
            <DeveloperLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={<DeveloperDashboard />}
        />

        <Route
          path="tasks"
          element={<DeveloperTasks />}
        />

        <Route
          path="projects"
          element={<DeveloperProjects />}
        />

        <Route
          path="team"
          element={<DeveloperTeam />}
        />

        <Route
          path="chat"
          element={<DeveloperChat />}
        />

        <Route
          path="ai-code"
          element={<DeveloperAICode />}
        />

        <Route
          path="manager-reviews"
          element={<DeveloperManagerReviews />}
        />

        <Route
          path="settings"
          element={<DeveloperSettings />}
        />

      </Route>


      {/* =================================================
          UI/UX DESIGNER
      ================================================= */}

      <Route
        path="/dashboard/uiux"
        element={
          <ProtectedRoute
            allowedRoles={["UI/UX Designer"]}
          >
            <DeveloperLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={<DeveloperDashboard />}
        />

        <Route
          path="tasks"
          element={<DeveloperTasks />}
        />

        <Route
          path="projects"
          element={<DeveloperProjects />}
        />

        <Route
          path="team"
          element={<DeveloperTeam />}
        />

        <Route
          path="chat"
          element={<DeveloperChat />}
        />

        <Route
          path="ai-code"
          element={<DeveloperAICode />}
        />

        <Route
          path="manager-reviews"
          element={<DeveloperManagerReviews />}
        />

        <Route
          path="settings"
          element={<DeveloperSettings />}
        />

      </Route>


      {/* =================================================
          QA TESTER
      ================================================= */}

      <Route
        path="/dashboard/qa"
        element={
          <ProtectedRoute
            allowedRoles={["QA Tester"]}
          >
            <DeveloperLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={<DeveloperDashboard />}
        />

        <Route
          path="tasks"
          element={<DeveloperTasks />}
        />

        <Route
          path="projects"
          element={<DeveloperProjects />}
        />

        <Route
          path="team"
          element={<DeveloperTeam />}
        />

        <Route
          path="chat"
          element={<DeveloperChat />}
        />

        <Route
          path="ai-code"
          element={<DeveloperAICode />}
        />

        <Route
          path="manager-reviews"
          element={<DeveloperManagerReviews />}
        />

        <Route
          path="settings"
          element={<DeveloperSettings />}
        />

      </Route>


      {/* =================================================
          FALLBACK
      ================================================= */}

      <Route
        path="*"
        element={<Landing />}
      />

    </Routes>

  );
}