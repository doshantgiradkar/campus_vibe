import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  where,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// Types
export interface PaymentRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  amount: number;
  date: Timestamp;
  tier: string;
  couponApplied: string | null;
  userId: string;
  userEmail: string;
  status: 'completed' | 'refunded' | 'pending';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PricingTier {
  name: string;
  price: number;
  available: boolean;
  benefits?: string;
}

export interface EventPricing {
  id: string;
  eventId: string;
  eventTitle: string;
  pricingTiers: PricingTier[];
  validCoupons: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection references
const paymentsCollection = collection(db, 'payments');
const eventPricingCollection = collection(db, 'eventPricing');

// Get all payments
export const getAllPayments = async (): Promise<PaymentRecord[]> => {
  try {
    const q = query(paymentsCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PaymentRecord[];
  } catch (error) {
    console.error('Error getting payments:', error);
    throw error;
  }
};

// Get payments by status
export const getPaymentsByStatus = async (status: PaymentRecord['status']): Promise<PaymentRecord[]> => {
  try {
    const q = query(
      paymentsCollection, 
      where('status', '==', status),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PaymentRecord[];
  } catch (error) {
    console.error('Error getting payments by status:', error);
    throw error;
  }
};

// Get payments by user
export const getPaymentsByUser = async (userId: string): Promise<PaymentRecord[]> => {
  try {
    const q = query(
      paymentsCollection, 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PaymentRecord[];
  } catch (error) {
    console.error('Error getting payments by user:', error);
    throw error;
  }
};

// Get payments by event
export const getPaymentsByEvent = async (eventId: string): Promise<PaymentRecord[]> => {
  try {
    const q = query(
      paymentsCollection, 
      where('eventId', '==', eventId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PaymentRecord[];
  } catch (error) {
    console.error('Error getting payments by event:', error);
    throw error;
  }
};

// Create a payment record
export const createPayment = async (paymentData: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentRecord> => {
  try {
    const paymentWithTimestamps = {
      ...paymentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(paymentsCollection, paymentWithTimestamps);
    
    return {
      id: docRef.id,
      ...paymentWithTimestamps
    };
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Update a payment record (e.g., for refunds)
export const updatePayment = async (
  id: string, 
  paymentData: Partial<Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'payments', id);
    await updateDoc(docRef, {
      ...paymentData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

// Get all event pricing
export const getAllEventPricing = async (): Promise<EventPricing[]> => {
  try {
    const q = query(eventPricingCollection, orderBy('eventTitle'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EventPricing[];
  } catch (error) {
    console.error('Error getting event pricing:', error);
    throw error;
  }
};

// Get event pricing by event ID
export const getEventPricingByEventId = async (eventId: string): Promise<EventPricing | null> => {
  try {
    const q = query(eventPricingCollection, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as EventPricing;
  } catch (error) {
    console.error('Error getting event pricing:', error);
    throw error;
  }
};

// Create or update event pricing
export const saveEventPricing = async (
  eventPricing: Omit<EventPricing, 'id' | 'createdAt' | 'updatedAt'>
): Promise<EventPricing> => {
  try {
    // Check if pricing already exists for this event
    const existingPricing = await getEventPricingByEventId(eventPricing.eventId);
    
    if (existingPricing) {
      // Update existing pricing
      const docRef = doc(db, 'eventPricing', existingPricing.id);
      await updateDoc(docRef, {
        ...eventPricing,
        updatedAt: serverTimestamp()
      });
      
      return {
        ...existingPricing,
        ...eventPricing,
        updatedAt: Timestamp.now()
      };
    } else {
      // Create new pricing
      const pricingWithTimestamps = {
        ...eventPricing,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(eventPricingCollection, pricingWithTimestamps);
      
      return {
        id: docRef.id,
        ...pricingWithTimestamps
      };
    }
  } catch (error) {
    console.error('Error saving event pricing:', error);
    throw error;
  }
}; 