import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import EventCard, { EventType } from '../components/events/EventCard';
import { useAuth } from '../contexts/AuthContext';
import { getAllEvents } from '../services/eventService';
import { toast } from 'react-toastify';

const EVENT_CATEGORIES = ['All', 'Technology', 'Arts', 'Career', 'Academic', 'Sports', 'Cultural'];

export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    // Fetch real events from Firestore
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Get all events from Firestore
        const eventData = await getAllEvents();
        
        // Transform the data to match the EventType interface
        const formattedEvents: EventType[] = eventData.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: `${event.startTime} - ${event.endTime}`,
          location: event.location,
          organizerId: event.organizerId,
          organizerName: event.organizerName,
          imageUrl: event.imageUrl || event.image, // Support both fields
          category: event.category,
          // These would ideally come from a user events service
          isRegistered: false, // This should be set based on user registration status
          isBookmarked: false  // This should be set based on user bookmarks
        }));
        
        setEvents(formattedEvents);
        setFilteredEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by date
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(today.getMonth() + 1);

    if (dateFilter === 'today') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === today.toDateString();
      });
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= oneWeekFromNow;
      });
    } else if (dateFilter === 'month') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= oneMonthFromNow;
      });
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategory, dateFilter]);

  const handleBookmark = (id: string) => {
    // In a real implementation, this would update a user's bookmarks in Firestore
    // For now, we'll just update the local state
    setEvents(events.map(event => 
      event.id === id 
        ? { ...event, isBookmarked: !event.isBookmarked } 
        : event
    ));
    
    // Show toast notification
    const event = events.find(e => e.id === id);
    if (event) {
      const message = event.isBookmarked 
        ? `Removed ${event.title} from bookmarks` 
        : `Added ${event.title} to bookmarks`;
      toast.success(message);
    }
  };

  const handleRegister = (id: string) => {
    // In a real implementation, this would register the user for the event in Firestore
    // For now, we'll just update the local state
    setEvents(events.map(event => 
      event.id === id 
        ? { ...event, isRegistered: !event.isRegistered } 
        : event
    ));
    
    // Show toast notification
    const event = events.find(e => e.id === id);
    if (event) {
      const message = event.isRegistered 
        ? `Unregistered from ${event.title}` 
        : `Registered for ${event.title}`;
      toast.success(message);
    }
  };

  return (
    <Layout>
      <div className="pt-8 pb-16 px-4 max-w-screen-xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover and participate in a variety of events happening across campus. 
            From academic lectures to social activities, find events that match your interests.
          </p>
        </div>

        {/* Filters section */}
        <div className="mb-10 space-y-4">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 pl-10"
            />
            <div className="absolute left-3 top-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <div className="flex flex-wrap justify-center gap-2">
              {EVENT_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setDateFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  dateFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Dates
              </button>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  dateFilter === 'today'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  dateFilter === 'week'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  dateFilter === 'month'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                This Month
              </button>
            </div>
          </div>
        </div>

        {/* Create event link for appropriate users */}
        {currentUser?.role !== 'user' && (
          <div className="flex justify-center mb-8">
            <Link
              to="/events/create"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </Link>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* No results */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-600">No events found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters or check back later for new events.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onBookmark={handleBookmark}
                    onRegister={handleRegister}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 