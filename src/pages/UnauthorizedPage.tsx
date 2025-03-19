import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function UnauthorizedPage() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const requiredRole = location.state?.requiredRole || 'appropriate';

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="rounded-full bg-red-100 p-4 mb-6">
          <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 text-center">Access Denied</h1>
        
        <p className="mt-4 text-lg text-gray-600 text-center max-w-md">
          You don't have the {requiredRole} role required to access this page.
        </p>
        
        <p className="mt-2 text-gray-500 text-center">
          Your current role: <span className="font-medium">{currentUser?.role || 'Guest'}</span>
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Back to Homepage
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-primary-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 text-center w-full max-w-md">
          <p className="text-gray-500">
            If you believe this is a mistake, please contact our support team.
          </p>
        </div>
      </div>
    </Layout>
  );
} 