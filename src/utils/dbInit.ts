import { db } from '../firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

/**
 * Initialize Firestore with some sample data for development purposes
 */
export const initializeFirestoreData = async () => {
  try {
    // Create campus stats document
    await setDoc(doc(db, 'stats', 'campus'), {
      eventsCount: 350,
      clubsCount: 120,
      departmentsCount: 40,
      usersCount: 8000
    });
    
    // Create sample events
    const eventsCollection = collection(db, 'events');
    
    await addDoc(eventsCollection, {
      title: 'Annual Tech Conference',
      description: 'Join us for a day of tech talks, workshops, and networking with industry professionals.',
      date: '2025-04-15',
      time: '10:00 AM - 4:00 PM',
      location: 'Main Auditorium',
      organizerId: 'org1',
      organizerName: 'Computer Science Club',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    });
    
    await addDoc(eventsCollection, {
      title: 'Spring Music Festival',
      description: 'A celebration of music featuring performances by student bands and local artists.',
      date: '2025-05-10',
      time: '5:00 PM - 10:00 PM',
      location: 'Campus Quad',
      organizerId: 'org2',
      organizerName: 'Music Association',
      category: 'Music',
      image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    });
    
    await addDoc(eventsCollection, {
      title: 'Career Fair',
      description: 'Meet with recruiters from top companies looking to hire for internships and full-time positions.',
      date: '2025-04-20',
      time: '12:00 PM - 5:00 PM',
      location: 'Student Center',
      organizerId: 'org3',
      organizerName: 'Career Services',
      category: 'Career',
      image: 'https://images.unsplash.com/photo-1560523159-4a9692d222ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    });
    
    console.log('Sample data has been initialized in Firestore!');
  } catch (error) {
    console.error('Error initializing Firestore data:', error);
  }
}; 