import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ClubsPage from './pages/ClubsPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import CreateEventPage from './pages/CreateEventPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './firebase';
import RegisteredEventsPage from './pages/RegisteredEventsPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { seedAdminUser, seedTestUsers } from './utils/seedUsers';
import EventRegistrationPage from './pages/EventRegistrationPage';
import PaymentGatewayPage from './pages/PaymentGatewayPage';

// Lazy load less important pages to improve initial load time
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminEventManagementPage from './pages/AdminEventManagementPage';
import AdminPaymentPage from './pages/AdminPaymentPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminDepartmentManagementPage from './pages/AdminDepartmentManagementPage';
import AdminClubManagementPage from './pages/AdminClubManagementPage';
import AdminMentorManagementPage from './pages/AdminMentorManagementPage';

// Initialize the app with seed data
const initializeApp = async () => {
  try {
    // Seed the admin user
    await seedAdminUser();
    
    // Seed test users in development mode
    if (import.meta.env.DEV) {
      await seedTestUsers();
    }
  } catch (error) {
    console.error('Error initializing app with seed data:', error);
  }
};

// Call initialization
initializeApp();

// TransitionWrapper component to handle page transitions
const TransitionWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname}>{children}</div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <BrowserRouter>
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <TransitionWrapper>
                  <HomePage />
                </TransitionWrapper>
              } 
            />
            <Route 
              path="/login" 
              element={
                <TransitionWrapper>
                  <LoginPage />
                </TransitionWrapper>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <TransitionWrapper>
                  <SignupPage />
                </TransitionWrapper>
              } 
            />
            <Route 
              path="/departments" 
              element={
                <TransitionWrapper>
                  <DepartmentsPage />
                </TransitionWrapper>
              } 
            />
            <Route 
              path="/clubs" 
              element={
                <TransitionWrapper>
                  <ClubsPage />
                </TransitionWrapper>
              } 
            />
            <Route 
              path="/events" 
              element={
                <TransitionWrapper>
                  <EventsPage />
                </TransitionWrapper>
              } 
            />
            <Route 
              path="/events/:eventId" 
              element={
                <TransitionWrapper>
                  <EventDetailsPage />
                </TransitionWrapper>
              } 
            />
            <Route 
              path="/unauthorized" 
              element={
                <TransitionWrapper>
                  <UnauthorizedPage />
                </TransitionWrapper>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <TransitionWrapper>
                    <DashboardPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <TransitionWrapper>
                    <ProfilePage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            {/* Role-specific Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TransitionWrapper>
                    <AdminDashboardPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/events" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TransitionWrapper>
                    <AdminEventManagementPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/events/create" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TransitionWrapper>
                    <CreateEventPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/events/edit/:eventId" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TransitionWrapper>
                    <CreateEventPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/payments" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TransitionWrapper>
                    <AdminPaymentPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TransitionWrapper>
                    <AdminUserManagementPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/departments" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TransitionWrapper>
                    <AdminDepartmentManagementPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/clubs" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TransitionWrapper>
                    <AdminClubManagementPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/mentors" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <TransitionWrapper>
                    <AdminMentorManagementPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/events/manage" 
              element={
                <ProtectedRoute requiredRole="eventManager">
                  <TransitionWrapper>
                    <div>Event Management</div>
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/events/create" 
              element={
                <TransitionWrapper>
                  <CreateEventPage />
                </TransitionWrapper>
              } 
            />
            
            <Route 
              path="/my-events" 
              element={
                <ProtectedRoute>
                  <TransitionWrapper>
                    <RegisteredEventsPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/payment-history" 
              element={
                <ProtectedRoute>
                  <TransitionWrapper>
                    <PaymentHistoryPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/events/:eventId/register" 
              element={
                <ProtectedRoute>
                  <TransitionWrapper>
                    <EventRegistrationPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/payment-gateway" 
              element={
                <ProtectedRoute>
                  <TransitionWrapper>
                    <PaymentGatewayPage />
                  </TransitionWrapper>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route 
              path="*" 
              element={
                <TransitionWrapper>
                  <NotFoundPage />
                </TransitionWrapper>
              } 
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;