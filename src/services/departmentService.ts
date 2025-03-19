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
} from 'firebase/firestore';
import { db } from '../firebase';
import { Department } from '../models/types';
import { uploadImageToCloudinary } from './imageService';

// Collection reference
const departmentsCollection = collection(db, 'departments');

// Get all departments
export const getAllDepartments = async (): Promise<Department[]> => {
  try {
    const q = query(departmentsCollection, orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Department[];
  } catch (error) {
    console.error('Error getting departments:', error);
    throw error;
  }
};

// Get department by ID
export const getDepartmentById = async (id: string): Promise<Department | null> => {
  try {
    const docRef = doc(db, 'departments', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Department;
  } catch (error) {
    console.error('Error getting department:', error);
    throw error;
  }
};

// Create a new department
export const createDepartment = async (departmentData: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>, departmentImage?: File): Promise<Department> => {
  try {
    // Upload image to Cloudinary if provided
    let imageUrl: string | undefined;
    if (departmentImage) {
      imageUrl = await uploadImageToCloudinary(departmentImage, 'departments');
    }

    // Create the department with the image URL
    const newDepartment = {
      ...departmentData,
      image: imageUrl || departmentData.image,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(departmentsCollection, newDepartment);
    
    return {
      id: docRef.id,
      ...newDepartment
    } as Department;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

// Update a department
export const updateDepartment = async (id: string, departmentData: Partial<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>, departmentImage?: File): Promise<void> => {
  try {
    const docRef = doc(db, 'departments', id);
    
    // Upload image to Cloudinary if provided
    let imageUrl: string | undefined;
    if (departmentImage) {
      imageUrl = await uploadImageToCloudinary(departmentImage, 'departments');
    }

    // Update the department data
    const updateData = {
      ...departmentData,
      ...(imageUrl && { image: imageUrl }),
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

// Delete a department
export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'departments', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
}; 