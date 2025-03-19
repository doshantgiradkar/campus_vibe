import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { Mentor } from '../models/types';
import { uploadImageToCloudinary } from './imageService';

// Collection reference
const mentorsCollection = collection(db, 'mentors');

// Get all mentors
export const getAllMentors = async (): Promise<Mentor[]> => {
  try {
    const q = query(mentorsCollection, orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Mentor[];
  } catch (error) {
    console.error('Error getting mentors:', error);
    throw error;
  }
};

// Get mentors by department
export const getMentorsByDepartment = async (departmentId: string): Promise<Mentor[]> => {
  try {
    const q = query(
      mentorsCollection,
      where('departmentId', '==', departmentId),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Mentor[];
  } catch (error) {
    console.error('Error getting mentors by department:', error);
    throw error;
  }
};

// Get mentor by ID
export const getMentorById = async (id: string): Promise<Mentor | null> => {
  try {
    const docRef = doc(db, 'mentors', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Mentor;
  } catch (error) {
    console.error('Error getting mentor:', error);
    throw error;
  }
};

// Create a new mentor
export const createMentor = async (mentorData: Omit<Mentor, 'id' | 'createdAt' | 'updatedAt'>, mentorImage?: File): Promise<Mentor> => {
  try {
    // Upload image to Cloudinary if provided
    let imageUrl: string | undefined;
    if (mentorImage) {
      imageUrl = await uploadImageToCloudinary(mentorImage, 'mentors');
    }

    // Create the mentor with the image URL
    const newMentor = {
      ...mentorData,
      profileImage: imageUrl || mentorData.profileImage,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(mentorsCollection, newMentor);
    
    return {
      id: docRef.id,
      ...newMentor
    } as Mentor;
  } catch (error) {
    console.error('Error creating mentor:', error);
    throw error;
  }
};

// Update a mentor
export const updateMentor = async (id: string, mentorData: Partial<Omit<Mentor, 'id' | 'createdAt' | 'updatedAt'>>, mentorImage?: File): Promise<void> => {
  try {
    const docRef = doc(db, 'mentors', id);
    
    // Upload image to Cloudinary if provided
    let imageUrl: string | undefined;
    if (mentorImage) {
      imageUrl = await uploadImageToCloudinary(mentorImage, 'mentors');
    }

    // Update the mentor data
    const updateData = {
      ...mentorData,
      ...(imageUrl && { profileImage: imageUrl }),
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating mentor:', error);
    throw error;
  }
};

// Delete a mentor
export const deleteMentor = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'mentors', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting mentor:', error);
    throw error;
  }
}; 