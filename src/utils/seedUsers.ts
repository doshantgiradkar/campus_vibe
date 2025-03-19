import { getDoc, doc, setDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { User } from '../models/types';

/**
 * Seeds a default admin user if none exists
 * This is useful for initial setup of the application
 */
export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminEmail = 'admin@campusvibe.edu';
    const adminPassword = 'admin123'; // This should be changed immediately after first login
    
    // Check if the admin user already exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', 'admin'));
    
    if (!userDoc.exists()) {
      console.log('Seeding admin user...');
      
      try {
        // Create the admin user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          adminEmail,
          adminPassword
        );
        
        const uid = userCredential.user.uid;
        
        // Create admin user data in Firestore
        const adminData: Omit<User, 'id'> = {
          name: 'Admin User',
          email: adminEmail,
          role: 'admin',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        // Save admin user to Firestore
        await setDoc(doc(db, 'users', uid), adminData);
        
        console.log('Admin user created successfully!');
      } catch (error) {
        // Handle case where the user might exist in Authentication but not in Firestore
        console.error('Error creating admin user:', error);
      }
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

/**
 * Seeds test users for development purposes
 */
export const seedTestUsers = async (): Promise<void> => {
  if (import.meta.env.MODE !== 'development') {
    return; // Only run in development mode
  }
  
  const testUsers = [
    {
      email: 'student@campusvibe.edu',
      password: 'student123',
      name: 'Student User',
      role: 'user'
    },
    {
      email: 'department@campusvibe.edu',
      password: 'department123',
      name: 'Department Manager',
      role: 'department'
    },
    {
      email: 'club@campusvibe.edu',
      password: 'club123',
      name: 'Club Manager',
      role: 'club'
    }
  ];
  
  for (const user of testUsers) {
    try {
      // Check if the user already exists in Firestore by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log(`Seeding test user: ${user.email}...`);
        
        try {
          // Create the user in Firebase Authentication
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            user.email,
            user.password
          );
          
          const uid = userCredential.user.uid;
          
          // Create user data in Firestore
          const userData: Omit<User, 'id'> = {
            name: user.name,
            email: user.email,
            role: user.role as User['role'],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };
          
          // Save user to Firestore
          await setDoc(doc(db, 'users', uid), userData);
          
          console.log(`Test user ${user.email} created successfully!`);
        } catch (error) {
          console.error(`Error creating test user ${user.email}:`, error);
        }
      } else {
        console.log(`Test user ${user.email} already exists`);
      }
    } catch (error) {
      console.error(`Error checking for existing user ${user.email}:`, error);
    }
  }
}; 