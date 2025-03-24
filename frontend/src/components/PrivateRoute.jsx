import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export const AdminRoute = () => {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const UserRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};
