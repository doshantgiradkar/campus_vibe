import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'eventManager' | 'department' | 'club';
};

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { currentUser, isAdmin, isDepartment, isClub } = useAuth();
  
  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // If a specific role is required
  if (requiredRole) {
    // Admin role check
    if (requiredRole === 'admin' && !isAdmin) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    // Department role check
    if (requiredRole === 'department' && !isDepartment) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    // Club role check
    if (requiredRole === 'club' && !isClub) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Legacy eventManager role check (kept for backward compatibility)
    if (requiredRole === 'eventManager' && !isAdmin && !isDepartment && !isClub) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // If all checks pass, render the protected content
  return <>{children}</>;
} 