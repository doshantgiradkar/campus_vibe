import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import EventCard, { EventType } from '../components/events/EventCard';

// Mock data for featured events
const MOCK_EVENTS: EventType[] = [
  {
    id: '1',
    title: 'Annual Tech Conference',
    description: 'Join us for a day of tech talks, workshops, and networking with industry professionals.',
    date: '2025-04-15',
    time: '10:00 AM - 4:00 PM',
    location: 'Main Auditorium',
    organizerId: 'org1',
    organizerName: 'Computer Science Club',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: '2',
    title: 'Spring Music Festival',
    description: 'A celebration of music featuring performances by student bands and local artists.',
    date: '2025-05-10',
    time: '5:00 PM - 10:00 PM',
    location: 'Campus Quad',
    organizerId: 'org2',
    organizerName: 'Music Association',
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: '3',
    title: 'Career Fair',
    description: 'Meet with recruiters from top companies looking to hire for internships and full-time positions.',
    date: '2025-04-20',
    time: '12:00 PM - 5:00 PM',
    location: 'Student Center',
    organizerId: 'org3',
    organizerName: 'Career Services',
    category: 'Career',
    image: 'https://images.unsplash.com/photo-1560523159-4a9692d222ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  },
];

// Stats for campus life
const CAMPUS_STATS = [
  { label: 'Events This Year', value: '350+' },
  { label: 'Student Clubs', value: '120+' },
  { label: 'Departments', value: '40+' },
  { label: 'Active Users', value: '8,000+' },
];

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animateStats, setAnimateStats] = useState(false);

  // Animate stats when visible in viewport
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setAnimateStats(true);
          observer.disconnect();
        }
      });
    });
    
    const statsSection = document.getElementById('stats-section');
    if (statsSection) observer.observe(statsSection);
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Simulate loading data from API
    const fetchEvents = async () => {
      setIsLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        setFeaturedEvents(MOCK_EVENTS);
        setIsLoading(false);
      }, 500);
    };

    fetchEvents();
  }, []);

  const handleBookmark = (id: string) => {
    setFeaturedEvents(events => 
      events.map(event => 
        event.id === id 
          ? { ...event, isBookmarked: !event.isBookmarked } 
          : event
      )
    );
  };

  return (
    <Layout>
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white">
        {/* Animated Circles Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-700 rounded-full opacity-20"></div>
          <div className="absolute top-60 -right-20 w-60 h-60 bg-primary-600 rounded-full opacity-10"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-700 rounded-full opacity-20"></div>
          <div className="absolute -top-60 left-40 w-60 h-60 bg-primary-600 rounded-full opacity-10"></div>
        </div>
        
        <div className="relative max-w-screen-xl mx-auto px-4 py-28 sm:px-6 lg:px-8 lg:py-32 flex flex-col items-center text-center">
          <div className="animate-fadeIn">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              <span className="block">Discover & Connect</span>
              <span className="block text-primary-300">Your Campus Life</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 text-white/80 font-light">
              Find events, join clubs, explore departments, and connect with your campus community in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="px-8 py-4 bg-white text-primary-800 font-semibold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-lg"
              >
                Explore Events
              </Link>
              <Link
                to="/signup"
                className="px-8 py-4 border-2 border-white/80 text-white font-semibold rounded-xl hover:bg-white/10 transition-all transform hover:scale-105"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white rounded-t-[50%] transform translate-y-1/2"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white" id="stats-section">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            {CAMPUS_STATS.map((stat, index) => (
              <div key={index} className="text-center transform transition-all duration-700 ease-out" 
                   style={{ 
                     opacity: animateStats ? 1 : 0, 
                     transform: animateStats ? 'translateY(0)' : 'translateY(20px)',
                     transitionDelay: `${index * 150}ms`
                   }}>
                <p className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 px-4 max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Events</h2>
            <p className="text-gray-600 max-w-2xl">Discover upcoming events and activities happening across campus</p>
          </div>
          <Link 
            to="/events" 
            className="mt-4 md:mt-0 inline-flex items-center text-primary-600 hover:text-primary-800 font-medium transition-colors group"
          >
            View All Events
            <svg className="w-5 h-5 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md h-96 animate-pulse overflow-hidden">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <div key={event.id} className="transform transition-all duration-300 hover:-translate-y-2">
                <EventCard
                  event={event}
                  onBookmark={handleBookmark}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section with Icons */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Campus Life
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides all the tools and resources you need to make the most of your campus experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Discover Events</h3>
              <p className="text-gray-600 text-center">
                Find and register for a variety of campus events, from academic lectures to social gatherings.
              </p>
              <div className="mt-6 text-center">
                <Link to="/events" className="text-primary-600 hover:text-primary-800 font-medium inline-flex items-center">
                  Browse Events
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Join Clubs</h3>
              <p className="text-gray-600 text-center">
                Connect with clubs and student organizations that match your interests and passions.
              </p>
              <div className="mt-6 text-center">
                <Link to="/clubs" className="text-primary-600 hover:text-primary-800 font-medium inline-flex items-center">
                  Explore Clubs
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Explore Departments</h3>
              <p className="text-gray-600 text-center">
                Learn about different academic departments, their courses, faculty, and resources.
              </p>
              <div className="mt-6 text-center">
                <Link to="/departments" className="text-primary-600 hover:text-primary-800 font-medium inline-flex items-center">
                  View Departments
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Background */}
      <section className="py-20 px-4 relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="opacity-10" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="white" d="M39.9,-65.7C51.1,-60.5,59.9,-48.8,61.3,-36.6C62.7,-24.4,56.8,-12.2,55.4,-0.8C54,10.6,57.2,21.2,54.3,30.2C51.5,39.2,42.7,46.6,32.6,52.8C22.5,59,11.2,64,-1.3,66.1C-13.9,68.2,-27.8,67.4,-39.5,61.5C-51.1,55.6,-60.7,44.6,-65.3,32.1C-70,19.6,-69.8,5.7,-67.1,-7C-64.3,-19.8,-59,-31.4,-50.1,-38.6C-41.1,-45.8,-28.6,-48.6,-17.1,-53.5C-5.6,-58.5,4.8,-65.5,16.3,-68.7C27.9,-72,39.7,-71.5,39.9,-65.7Z" transform="translate(100 100)" />
            </svg>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Enhance Your Campus Experience?
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Join thousands of students and organizations already using Campus Vibe to make the most of their time on campus.
            </p>
            <Link
              to="/signup"
              className="inline-flex justify-center items-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-lg"
            >
              Create Your Account
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
} 