import { Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome to Campus Vibe
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Discover and join campus events, connect with organizations, and enhance your campus experience.
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
} 