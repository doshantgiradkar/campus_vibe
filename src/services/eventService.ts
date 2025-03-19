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
  where,
  limit,
  FieldValue,
  increment as firestoreIncrement
} from 'firebase/firestore';
import { db } from '../firebase';
import { Event } from '../models/types';

// Collection reference
const eventsCollection = collection(db, 'events');

// Get all events
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    // Attempt to query with compound index
    try {
      const snapshot = await getDocs(query(
        eventsCollection, 
        where('status', '==', 'published'), 
        orderBy('date')
      ));
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
    } catch (error: unknown) {
      // Check if it's an index error
      if (error instanceof Error && error.message.includes('index')) {
        console.warn('Firestore index error. Using alternative query approach.');
        // Fall back to simple query without sorting
        const snapshot = await getDocs(query(
          eventsCollection,
          where('status', '==', 'published')
        ));
        
        // Sort events by date manually (client-side)
        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Event));
        
        return events.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
      }
      // If not an index error, rethrow
      throw error;
    }
  } catch (error) {
    console.error('Error getting events:', error);
    // If it's a Firebase error with a link to create index, extract the link
    if (error instanceof Error && error.message.includes('https://console.firebase.google.com')) {
      const indexLink = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0];
      if (indexLink) {
        console.warn(`To improve performance, please create the Firestore index: ${indexLink}`);
      }
    }
    throw error;
  }
};

// Get events by filter
export const getFilteredEvents = async (
  searchTerm?: string,
  category?: string,
  startDate?: Date,
  endDate?: Date
): Promise<Event[]> => {
  try {
    const eventQuery = query(
      eventsCollection,
      where('status', '==', 'published'),
      orderBy('date')
    );

    // Apply additional filters if provided
    // Note: Firestore has limitations with multiple inequality filters
    // For complex filtering, we might need to filter some data in-memory

    const snapshot = await getDocs(eventQuery);
    let events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Event));

    // Apply client-side filtering for search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term)
      );
    }

    // Apply client-side filtering for category
    if (category && category !== 'All') {
      events = events.filter(event => event.category === category);
    }

    // Apply client-side filtering for date range
    if (startDate) {
      events = events.filter(event => new Date(event.date) >= startDate);
    }
    
    if (endDate) {
      events = events.filter(event => new Date(event.date) <= endDate);
    }

    return events;
  } catch (error) {
    console.error('Error filtering events:', error);
    throw error;
  }
};

// Get upcoming events
export const getUpcomingEvents = async (count: number = 10): Promise<Event[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayString = today.toISOString().split('T')[0];
    
    try {
      // Try with compound index first
      const snapshot = await getDocs(
        query(
          eventsCollection,
          where('status', '==', 'published'),
          where('date', '>=', todayString),
          orderBy('date'),
          limit(count)
        )
      );
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
    } catch (error: unknown) {
      // Check if it's an index error
      if (error instanceof Error && error.message.includes('index')) {
        console.warn('Firestore index error getting upcoming events. Using alternative approach.');
        
        // Fallback: get all published events and filter client-side
        const snapshot = await getDocs(
          query(
            eventsCollection,
            where('status', '==', 'published')
          )
        );
        
        const allEvents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Event));
        
        // Client-side filtering for upcoming events
        const upcomingEvents = allEvents
          .filter(event => event.date >= todayString)
          .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, count);
        
        return upcomingEvents;
      }
      
      // If not an index error, rethrow
      throw error;
    }
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    // If it's a Firebase error with a link to create index, extract the link
    if (error instanceof Error && error.message.includes('https://console.firebase.google.com')) {
      const indexLink = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0];
      if (indexLink) {
        console.warn(`To improve performance, please create the Firestore index: ${indexLink}`);
      }
    }
    throw error;
  }
};

// Get events by category
export const getEventsByCategory = async (category: string): Promise<Event[]> => {
  try {
    const q = query(
      eventsCollection, 
      where('category', '==', category),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  } catch (error) {
    console.error('Error getting events by category:', error);
    throw error;
  }
};

// Get events created by a specific department
export const getEventsByDepartment = async (departmentId: string): Promise<Event[]> => {
  try {
    const q = query(
      eventsCollection, 
      where('departmentId', '==', departmentId),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  } catch (error) {
    console.error('Error getting events by department:', error);
    throw error;
  }
};

// Get events created by a specific club
export const getEventsByClub = async (clubId: string): Promise<Event[]> => {
  try {
    const q = query(
      eventsCollection, 
      where('clubId', '==', clubId),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  } catch (error) {
    console.error('Error getting events by club:', error);
    throw error;
  }
};

// Get event by ID
export const getEventById = async (id: string): Promise<Event | null> => {
  try {
    const docRef = doc(eventsCollection, id);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Event;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting event with ID ${id}:`, error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (
  eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> & { 
    organizerName?: string, 
    createdBy?: string, 
    agenda?: { time: string; activity: string }[] 
  }
): Promise<string> => {
  try {
    // Get organizer name if not provided
    if (!eventData.organizerName && eventData.organizerId) {
      if (eventData.organizerType === 'department') {
        const deptRef = doc(db, 'departments', eventData.organizerId);
        const deptSnap = await getDoc(deptRef);
        if (deptSnap.exists()) {
          eventData.organizerName = deptSnap.data().name;
        }
      } else if (eventData.organizerType === 'club') {
        const clubRef = doc(db, 'clubs', eventData.organizerId);
        const clubSnap = await getDoc(clubRef);
        if (clubSnap.exists()) {
          eventData.organizerName = clubSnap.data().name;
        }
      } else {
        // For admin organizer, use "Campus Administration" as default
        eventData.organizerName = 'Campus Administration';
      }
    }

    // Create event with timestamps
    const eventWithTimestamps = {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      attendeeCount: 0,
      agenda: eventData.agenda || []
    };

    // Remove undefined fields to prevent Firestore errors
    const cleanedEventData: Record<string, unknown> = {};
    Object.entries(eventWithTimestamps).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanedEventData[key] = value;
      }
    });

    const docRef = await addDoc(eventsCollection, cleanedEventData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an event
export const updateEvent = async (
  id: string, 
  eventData: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    // Add updatedAt timestamp
    const eventWithTimestamp = {
      ...eventData,
      updatedAt: serverTimestamp()
    };

    // Remove undefined fields to prevent Firestore errors
    const cleanedEventData: Record<string, unknown> = {};
    Object.entries(eventWithTimestamp).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanedEventData[key] = value;
      }
    });

    const docRef = doc(eventsCollection, id);
    await updateDoc(docRef, cleanedEventData);
  } catch (error) {
    console.error(`Error updating event with ID ${id}:`, error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    const docRef = doc(eventsCollection, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting event with ID ${id}:`, error);
    throw error;
  }
};

// Update attendee count
export const updateAttendeeCount = async (id: string, increment: number): Promise<void> => {
  try {
    const docRef = doc(eventsCollection, id);
    await updateDoc(docRef, {
      attendeeCount: firestoreIncrement(increment),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating attendee count for event ${id}:`, error);
    throw error;
  }
}; 