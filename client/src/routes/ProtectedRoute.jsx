import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // Not logged in
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // Check role
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    // Send user to their correct dashboard
    switch (user.role) {
      case "Project Manager":
        return <Navigate to="/dashboard/project-manager" replace />;

      case "Frontend Developer":
        return <Navigate to="/dashboard/frontend" replace />;

      case "Backend Developer":
        return <Navigate to="/dashboard/backend" replace />;

      case "UI/UX Designer":
        return <Navigate to="/dashboard/uiux" replace />;

      case "QA Tester":
        return <Navigate to="/dashboard/qa" replace />;

      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
}