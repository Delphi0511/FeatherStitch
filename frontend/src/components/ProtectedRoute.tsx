import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  allowedRole: "Customer" | "Tailor";
}

// Blocks unauthenticated or wrong-role users before a protected screen is rendered.
const ProtectedRoute = ({ children, allowedRole }: Props) => {
  const token = localStorage.getItem("token");
  let user: { usertype?: string } = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  if (!token || token === "undefined" || token === "null") {
    return <Navigate to="/login" replace />;
  }

  if (user.usertype !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
