import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactElement;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    // User is not logged in, redirect to login
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }

  if (!isAdmin) {
    // User is logged in but not an admin, redirect to home
    return <Navigate to="/" />;
  }

  // User is logged in and is an admin, render the component
  return children;
} 