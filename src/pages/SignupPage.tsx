import { Navigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function SignupPage() {
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
              Create an Account
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Join Campus Vibe to connect with campus activities, events, and organizations.
            </p>
          </div>
          
          <SignupForm />
        </div>
      </div>
    </Layout>
  );
} 