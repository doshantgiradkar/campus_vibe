import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { loginUser, registerUser as registerUserService, logoutUser } from '../services/userService';
import { User } from '../models/types';

// Define registration data interface
interface UserRegistrationData {
  email: string;
  password: string;
  userDetails: {
    name: string;
    phoneNumber?: string;
    department?: string;
    year?: string;
    bio?: string;
    interests?: string[];
    profileImage?: string;
  };
}

// Define AuthContextType
interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isDepartment: boolean;
  isClub: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  registerUser: (data: UserRegistrationData) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'id'>;
            setCurrentUser({
              id: firebaseUser.uid,
              ...userData
            });
          } else {
            // If no user document exists but a Firebase user does,
            // sign them out because our application requires Firestore data
            await auth.signOut();
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Check if the current user is an admin
  const isAdmin = currentUser?.role === 'admin';
  // Check if current user is a department
  const isDepartment = currentUser?.role === 'department';
  // Check if current user is a club
  const isClub = currentUser?.role === 'club';

  // Login functionality using Firebase
  async function login(email: string, password: string): Promise<void> {
    try {
      const user = await loginUser(email, password);
      setCurrentUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Register functionality using Firebase (basic version)
  async function register(name: string, email: string, password: string): Promise<void> {
    try {
      const user = await registerUserService(name, email, password);
      setCurrentUser(user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Enhanced registration with additional profile data
  async function registerUser(data: UserRegistrationData): Promise<void> {
    try {
      // Extract basic info
      const { email, password, userDetails } = data;
      
      // Register the user with Firebase Authentication and create basic Firestore record
      const newUser = await registerUserService(userDetails.name, email, password);
      
      // Update the user with additional profile information
      if (newUser && newUser.id) {
        await import('../services/userService').then(async ({ updateUserProfile }) => {
          await updateUserProfile(newUser.id, userDetails);
        });
      }
      
      setCurrentUser(newUser);
    } catch (error) {
      console.error('Enhanced registration failed:', error);
      throw error;
    }
  }

  // Logout functionality using Firebase
  async function logout(): Promise<void> {
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  // Context value
  const value = {
    currentUser,
    isAdmin,
    isDepartment,
    isClub,
    loading,
    login,
    register,
    registerUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 