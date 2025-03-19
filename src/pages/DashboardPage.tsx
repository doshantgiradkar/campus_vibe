import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getUserById } from '../services/userService';
import { getUpcomingEvents, getEventById } from '../services/eventService';
import { toast } from 'react-toastify';
import { EventRegistration } from '../models/types';

interface ActivityItem {
  id: string;
  type: 'event_registered' | 'club_joined' | 'department_followed' | 'event_bookmark';
  title: string;
  date: string;
  message: string;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  department: string;
  isRegistered: boolean;
  isBookmarked: boolean;
  image: string;
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    registeredEvents: 0,
    bookmarkedEvents: 0,
    activityPoints: 0
  });

  // Fetch user data and events
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || !currentUser.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Get user data from Firestore
        const userData = await getUserById(currentUser.id);
        const userRegistrations = userData?.registeredEvents || [];
        const userBookmarks = userData?.bookmarkedEvents || [];
        
        // Get upcoming events
        const upcomingEvents = await getUpcomingEvents(5);
        
        // Format events data
        const formattedEvents = upcomingEvents.map(event => ({
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          department: event.organizerName,
          isRegistered: userRegistrations.some(reg => reg.eventId === event.id),
          isBookmarked: userBookmarks.includes(event.id),
          image: event.imageUrl || event.image || 'https://via.placeholder.com/400x200?text=Event+Image'
        }));
        
        setEvents(formattedEvents);
        
        // Generate activity items from user data
        const activityItems: ActivityItem[] = [];
        
        // Add registration activities
        userRegistrations.forEach((registration: EventRegistration) => {
          activityItems.push({
            id: `reg-${registration.eventId}`,
            type: 'event_registered',
            title: registration.eventTitle,
            date: registration.registrationDate.toDate().toISOString(),
            message: 'You registered for this event'
          });
        });
        
        // Add bookmark activities if we have that data
        if (userBookmarks && userBookmarks.length > 0) {
          // We don't have timestamp for bookmarks, so use current time for simplicity
          // In a real implementation, you would store the bookmark time
          for (const bookmarkId of userBookmarks.slice(0, 3)) {
            try {
              const eventData = await getEventById(bookmarkId);
              if (eventData) {
                activityItems.push({
                  id: `bm-${bookmarkId}`,
                  type: 'event_bookmark',
                  title: eventData.title,
                  date: new Date().toISOString(),
                  message: 'You bookmarked this event'
                });
              }
            } catch (error) {
              console.error(`Error fetching bookmarked event ${bookmarkId}:`, error);
            }
          }
        }
        
        // Sort activities by date (newest first)
        activityItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Take the most recent 10 activities
        setActivities(activityItems.slice(0, 10));
        
        // Set user stats
        setStats({
          upcomingEvents: upcomingEvents.length,
          registeredEvents: userRegistrations.length,
          bookmarkedEvents: userBookmarks.length,
          activityPoints: userRegistrations.length * 2 + userBookmarks.length // Simple point system
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit'
    }).format(date);
  };

  // Helper to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'event_registered':
        return (
          <div className="p-2 bg-green-100 rounded-full">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'club_joined':
        return (
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'department_followed':
        return (
          <div className="p-2 bg-purple-100 rounded-full">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
      case 'event_bookmark':
        return (
          <div className="p-2 bg-amber-100 rounded-full">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {currentUser?.name || 'Student'}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Stats */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary-800 to-primary-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Your Stats</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary-600">{stats.upcomingEvents}</div>
                    <div className="text-sm text-gray-600">Upcoming Events</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{stats.registeredEvents}</div>
                    <div className="text-sm text-gray-600">Registered Events</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{stats.bookmarkedEvents}</div>
                    <div className="text-sm text-gray-600">Bookmarked Events</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{stats.activityPoints}</div>
                    <div className="text-sm text-gray-600">Activity Points</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary-800 to-primary-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
                <Link to="/events" className="text-white text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
                  View All
                </Link>
              </div>
              <div className="p-6">
                {events.length > 0 ? (
                  <div className="space-y-6">
                    {events.map(event => (
                      <div key={event.id} className="flex flex-col sm:flex-row gap-4 border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                        <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={event.image} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                          <div className="mt-1 flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-y-1 sm:gap-x-4">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {event.department}
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Link
                              to={`/events/${event.id}`}
                              className="px-3 py-1 text-xs font-medium bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                            >
                              View Details
                            </Link>
                            {event.isRegistered ? (
                              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Registered
                              </span>
                            ) : (
                              <Link
                                to={`/events/${event.id}`}
                                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                Register
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No upcoming events found.</p>
                    <Link to="/events" className="mt-2 inline-block text-primary-600 hover:text-primary-800">
                      Browse all events
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary-800 to-primary-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="p-6">
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map(activity => (
                      <div key={activity.id} className="flex items-start">
                        {getActivityIcon(activity.type)}
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-900">{activity.title}</h3>
                          <p className="text-sm text-gray-500">{activity.message}</p>
                          <span className="text-xs text-gray-400">{formatDate(activity.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity.</p>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary-800 to-primary-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Quick Links</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li>
                    <Link to="/profile" className="flex items-center text-gray-700 hover:text-primary-600 transition-colors">
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/registered-events" className="flex items-center text-gray-700 hover:text-primary-600 transition-colors">
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      My Events
                    </Link>
                  </li>
                  <li>
                    <Link to="/payment-history" className="flex items-center text-gray-700 hover:text-primary-600 transition-colors">
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Payment History
                    </Link>
                  </li>
                  <li>
                    <Link to="/departments" className="flex items-center text-gray-700 hover:text-primary-600 transition-colors">
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Departments
                    </Link>
                  </li>
                  <li>
                    <Link to="/clubs" className="flex items-center text-gray-700 hover:text-primary-600 transition-colors">
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Clubs
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 