import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: string[];
  fallbackPath?: string;
}

export default function RoleGuard({ allowedRoles, fallbackPath = "/admin" }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
