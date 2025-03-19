import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { EventType } from '../components/events/EventCard';
import { useAuth } from '../contexts/AuthContext';
import { getUserById } from '../services/userService';
import { getEventById } from '../services/eventService';
import { toast } from 'react-toastify';

// Filters
type FilterOption = 'upcoming' | 'past' | 'all';

interface RegisteredEvent extends EventType {
  registrationDate: string;
  price?: number;
  isPaid?: boolean;
  ticketType?: string;
  image?: string; // Added the missing 'image' property
}

export default function RegisteredEventsPage() {
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('upcoming');
  const [eventsToDisplay, setEventsToDisplay] = useState<RegisteredEvent[]>([]);
  const { currentUser } = useAuth();
  
  // Fetch registered events
  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!currentUser || !currentUser.id) {
        setRegisteredEvents([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Get user data from Firestore
        const userData = await getUserById(currentUser.id);
        
        if (userData?.registeredEvents && userData.registeredEvents.length > 0) {
          // Fetch full event details for each registered event
          const events = await Promise.all(
            userData.registeredEvents.map(async (registration) => {
              const eventData = await getEventById(registration.eventId);
              
              if (eventData) {
                return {
                  id: eventData.id,
                  title: eventData.title,
                  description: eventData.description,
                  date: eventData.date,
                  time: `${eventData.startTime} - ${eventData.endTime}`,
                  location: eventData.location,
                  organizerId: eventData.organizerId,
                  organizerName: eventData.organizerName,
                  category: eventData.category,
                  image: eventData.imageUrl || eventData.image || '',
                  isRegistered: true,
                  registrationDate: registration.registrationDate.toDate().toISOString(),
                  price: registration.paymentAmount,
                  isPaid: registration.paymentStatus === 'paid',
                  ticketType: registration.ticketType
                };
              }
              return null;
            })
          );
          
          // Filter out null values (events that couldn't be found)
          setRegisteredEvents(events.filter(Boolean) as RegisteredEvent[]);
        } else {
          setRegisteredEvents([]);
        }
      } catch (error) {
        console.error('Error fetching registered events:', error);
        toast.error('Failed to load your registered events');
        setRegisteredEvents([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRegisteredEvents();
  }, [currentUser]);
  
  // Apply filters
  useEffect(() => {
    const today = new Date();
    
    let filteredEvents = [...registeredEvents];
    
    if (filter === 'upcoming') {
      filteredEvents = filteredEvents.filter(event => new Date(event.date) >= today);
    } else if (filter === 'past') {
      filteredEvents = filteredEvents.filter(event => new Date(event.date) < today);
    }
    
    // Sort by date (upcoming events first)
    filteredEvents.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    setEventsToDisplay(filteredEvents);
  }, [registeredEvents, filter]);
  
  // Cancel registration
  const handleCancelRegistration = (eventId: string) => {
    // TODO: Implement actual cancellation with Firestore
    toast.info('Registration cancellation is not yet implemented');
    
    // For now, just update the UI
    setRegisteredEvents(prev => prev.filter(event => event.id !== eventId));
  };
  
  // Add to calendar
  const handleAddToCalendar = (event: EventType) => {
    const eventDate = new Date(event.date);
    const timeRange = event.time.split(' - ');
    const startTime = timeRange[0];
    const endTime = timeRange[1];
    
    // Format date and time for Google Calendar URL
    const formatDate = (date: Date, timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      
      if (period === 'PM' && hour < 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      date.setHours(hour);
      date.setMinutes(parseInt(minutes));
      
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startDate = formatDate(new Date(eventDate), startTime);
    const endDate = formatDate(new Date(eventDate), endTime);
    
    // Create Google Calendar URL
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    // Open in new tab
    window.open(calendarUrl, '_blank');
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Registered Events</h1>
          <p className="text-gray-600 mt-1">
            Manage your event registrations and add them to your calendar.
          </p>
          
          {/* Filter Tabs */}
          <div className="flex space-x-2 mt-6">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'upcoming'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'past'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
        </div>
        
        {eventsToDisplay.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-medium text-gray-900 mb-2">No Events Found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'upcoming' 
                ? 'You have no upcoming registered events.' 
                : filter === 'past' 
                  ? 'You have no past registered events.'
                  : 'You have not registered for any events yet.'}
            </p>
            <Link 
              to="/events" 
              className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {eventsToDisplay.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 h-48 md:h-auto">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Registered
                          </span>
                          {event.price && event.price > 0 && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              event.isPaid 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.isPaid ? 'Paid' : 'Payment Required'}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500 space-y-1 mb-4">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>
                              {new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{event.organizerName}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 line-clamp-2 mb-4">{event.description}</p>
                        
                        <div className="text-xs text-gray-500">
                          Registered on {new Date(event.registrationDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {event.price && event.price > 0 && (
                            <> • <span className="font-medium text-primary-600">${event.price.toFixed(2)}</span></>
                          )}
                          {event.ticketType && (
                            <> • {event.ticketType} Ticket</>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-6 flex md:flex-col gap-3">
                        <Link
                          to={`/events/${event.id}`}
                          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors whitespace-nowrap flex-1 text-center"
                        >
                          View Details
                        </Link>
                        
                        <button
                          onClick={() => handleAddToCalendar(event)}
                          className="px-4 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition-colors whitespace-nowrap flex-1"
                        >
                          Add to Calendar
                        </button>
                        
                        {new Date(event.date) >= new Date() && (
                          <button
                            onClick={() => handleCancelRegistration(event.id)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap flex-1"
                          >
                            Cancel Registration
                          </button>
                        )}

                        {event.price && event.price > 0 && !event.isPaid && (
                          <Link
                            to={`/events/${event.id}`}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors whitespace-nowrap flex-1 text-center"
                          >
                            Complete Payment
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Link to browse more events */}
        <div className="mt-8 text-center">
          <Link 
            to="/events" 
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            Browse more events
          </Link>
        </div>
      </div>
    </Layout>
  );
} 