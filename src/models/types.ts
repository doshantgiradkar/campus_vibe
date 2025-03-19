import { FieldValue, Timestamp } from 'firebase/firestore';

export interface Department {
  id: string;
  name: string;
  description: string;
  image: string;
  facultyCount: number;
  studentCount: number;
  courses: number;
  established: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  memberCount: number;
  foundedYear: string;
  meetingSchedule: string;
  president: string;
  contactEmail: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string;
  bio: string;
  image: string;
  officeHours: string;
  contactInfo: string;
  yearsOfExperience: number;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  maxAttendees: number;
  registrationDeadline: string;
  imageUrl: string;
  requirements: string;
  agenda: { time: string; activity: string }[];
  organizerType: 'admin' | 'department' | 'club';
  organizerId: string;
  organizerName: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  departmentId?: string;
  clubId?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  attendeeCount: number;
  capacity: number;
  image?: string;
  price?: number;
}

export interface EventRegistration {
  eventId: string;
  eventTitle: string;
  registrationDate: Timestamp;
  paymentStatus?: 'free' | 'paid' | 'refunded';
  paymentAmount?: number;
  ticketType?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'organizer' | 'department' | 'club';
  departmentId?: string;
  clubId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  registeredEvents?: EventRegistration[];
  bookmarkedEvents?: string[]; // Array of event IDs
  
  // Profile information
  phoneNumber?: string;
  department?: string;
  year?: string;
  bio?: string;
  interests?: string[];
  profileImage?: string;
} 