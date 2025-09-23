import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  isAllowed: boolean;
  redirectPath?: string;
  children: React.ReactElement;
};

export default function ProtectedRoute({
  isAllowed,
  redirectPath = "/",
  children,
}: ProtectedRouteProps) {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children;
}
