import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { Club } from '../models/types';
import { uploadImageToCloudinary } from './imageService';

// Collection reference
const clubsCollection = collection(db, 'clubs');

// Get all clubs
export const getAllClubs = async (): Promise<Club[]> => {
  try {
    const q = query(clubsCollection, orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Club[];
  } catch (error) {
    console.error('Error getting clubs:', error);
    throw error;
  }
};

// Get clubs by category
export const getClubsByCategory = async (category: string): Promise<Club[]> => {
  try {
    const q = query(
      clubsCollection, 
      where('category', '==', category),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Club[];
  } catch (error) {
    console.error('Error getting clubs by category:', error);
    throw error;
  }
};

// Get club by ID
export const getClubById = async (id: string): Promise<Club | null> => {
  try {
    const docRef = doc(db, 'clubs', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Club;
  } catch (error) {
    console.error('Error getting club:', error);
    throw error;
  }
};

// Create a new club
export const createClub = async (clubData: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>, clubImage?: File): Promise<Club> => {
  try {
    // Upload image to Cloudinary if provided
    let imageUrl: string | undefined;
    if (clubImage) {
      imageUrl = await uploadImageToCloudinary(clubImage, 'clubs');
    }

    // Create the club with the image URL
    const newClub = {
      ...clubData,
      image: imageUrl || clubData.image,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(clubsCollection, newClub);
    
    return {
      id: docRef.id,
      ...newClub
    } as Club;
  } catch (error) {
    console.error('Error creating club:', error);
    throw error;
  }
};

// Update a club
export const updateClub = async (id: string, clubData: Partial<Omit<Club, 'id' | 'createdAt' | 'updatedAt'>>, clubImage?: File): Promise<void> => {
  try {
    const docRef = doc(db, 'clubs', id);
    
    // Upload image to Cloudinary if provided
    let imageUrl: string | undefined;
    if (clubImage) {
      imageUrl = await uploadImageToCloudinary(clubImage, 'clubs');
    }

    // Update the club data
    const updateData = {
      ...clubData,
      ...(imageUrl && { image: imageUrl }),
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating club:', error);
    throw error;
  }
};

// Delete a club
export const deleteClub = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'clubs', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting club:', error);
    throw error;
  }
}; 