import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  allowedRole: "Customer" | "Tailor";
}

const ProtectedRoute = ({ children, allowedRole }: Props) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.usertype !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;