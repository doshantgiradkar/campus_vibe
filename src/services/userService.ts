import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  where,
  arrayUnion
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { User, EventRegistration } from '../models/types';
import { uploadImageToCloudinary } from './imageService';

// Collection reference
const usersCollection = collection(db, 'users');

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const q = query(usersCollection, orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (role: User['role']): Promise<User[]> => {
  try {
    const q = query(
      usersCollection, 
      where('role', '==', role),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Register a new user
export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Create user data in Firestore
    const userData: Omit<User, 'id'> = {
      name,
      email,
      role: 'user', // default role
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Use the UID from Firebase Auth as the document ID in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    // Return the new user with ID
    return {
      id: firebaseUser.uid,
      ...userData
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get the user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as User;
    } else {
      // User exists in Firebase Auth but not in Firestore
      console.warn(`User ${firebaseUser.uid} authenticated but has no Firestore record. Creating one.`);
      
      // Create a basic user document in Firestore
      const basicUserData: Omit<User, 'id'> = {
        name: firebaseUser.displayName || email.split('@')[0], // Use display name or email username as fallback
        email: firebaseUser.email || email,
        role: 'user', // Default role
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        registeredEvents: [],
        bookmarkedEvents: []
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), basicUserData);
      
      // Return the new user with ID
      return {
        id: firebaseUser.uid,
        ...basicUserData
      };
    }
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Update a user
export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
    // Note: In a real application, you would also need to delete the user from Firebase Authentication
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Register user for an event
export const registerUserForEvent = async (
  userId: string, 
  eventId: string, 
  registrationDetails: {
    eventTitle: string;
    paymentStatus?: 'free' | 'paid' | 'refunded';
    paymentAmount?: number;
    ticketType?: string;
  }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Create the registration record
    const registration: EventRegistration = {
      eventId: eventId,
      eventTitle: registrationDetails.eventTitle,
      registrationDate: Timestamp.now(),
      paymentStatus: registrationDetails.paymentStatus || 'free',
      paymentAmount: registrationDetails.paymentAmount || 0,
      ticketType: registrationDetails.ticketType || 'Standard'
    };
    
    // Update the user document to add this event to their registeredEvents array
    await updateDoc(userRef, {
      registeredEvents: arrayUnion(registration),
      updatedAt: serverTimestamp()
    });
    
    // You could also update the event document to increase attendee count here
    // or handle that in a separate function depending on your application architecture
  } catch (error) {
    console.error('Error registering user for event:', error);
    throw error;
  }
};

// Check if user is registered for an event
export const isUserRegisteredForEvent = async (userId: string, eventId: string): Promise<boolean> => {
  try {
    const userDoc = await getUserById(userId);
    
    if (!userDoc || !userDoc.registeredEvents) {
      return false;
    }
    
    return userDoc.registeredEvents.some(registration => registration.eventId === eventId);
  } catch (error) {
    console.error('Error checking user registration:', error);
    throw error;
  }
};

// Toggle bookmark for an event
export const toggleEventBookmark = async (userId: string, eventId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as Omit<User, 'id'>;
    const bookmarkedEvents = userData.bookmarkedEvents || [];
    
    let isBookmarked: boolean;
    
    if (bookmarkedEvents.includes(eventId)) {
      // Remove from bookmarks
      isBookmarked = false;
      await updateDoc(userRef, {
        bookmarkedEvents: bookmarkedEvents.filter(id => id !== eventId),
        updatedAt: serverTimestamp()
      });
    } else {
      // Add to bookmarks
      isBookmarked = true;
      await updateDoc(userRef, {
        bookmarkedEvents: arrayUnion(eventId),
        updatedAt: serverTimestamp()
      });
    }
    
    return isBookmarked;
  } catch (error) {
    console.error('Error toggling event bookmark:', error);
    throw error;
  }
};

// Get user's bookmarked events
export const getUserBookmarkedEvents = async (userId: string): Promise<string[]> => {
  try {
    const userDoc = await getUserById(userId);
    
    if (!userDoc || !userDoc.bookmarkedEvents) {
      return [];
    }
    
    return userDoc.bookmarkedEvents;
  } catch (error) {
    console.error('Error getting user bookmarked events:', error);
    throw error;
  }
};

// Update a user profile
export const updateUserProfile = async (id: string, profileData: Partial<User>, profileImage?: File): Promise<User> => {
  try {
    const docRef = doc(db, 'users', id);
    
    // Upload profile image to Cloudinary if provided
    let imageUrl: string | undefined;
    if (profileImage) {
      imageUrl = await uploadImageToCloudinary(profileImage, 'profiles');
    }
    
    // Update the user data with the new profile info
    const updatedData = {
      ...profileData,
      ...(imageUrl && { profileImage: imageUrl }),
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updatedData);
    
    // Get the updated user data
    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as User;
    } else {
      throw new Error('User document not found after update');
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}; 