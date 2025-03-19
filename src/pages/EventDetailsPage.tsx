import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getEventById, getAllEvents, updateAttendeeCount } from '../services/eventService';
import { registerUserForEvent, isUserRegisteredForEvent, toggleEventBookmark } from '../services/userService';
import { Event } from '../models/types';
import { toast } from 'react-toastify';

function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  // State for pricing tiers and coupons
  const [selectedTier, setSelectedTier] = useState<{
    name: string;
    price: number;
    available: boolean;
    benefits?: string;
  } | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [isCouponChecking, setIsCouponChecking] = useState(false);
  
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        // Get event from Firestore
        const eventData = await getEventById(eventId);
        
        if (eventData) {
          setEvent(eventData);
          
          // Check if the user is registered for this event
          if (currentUser && currentUser.id) {
            const registered = await isUserRegisteredForEvent(currentUser.id, eventId);
            setIsRegistered(registered);
            
            // You could also check bookmarked status here using a similar function
            // const bookmarked = await isEventBookmarked(currentUser.id, eventId);
            // setIsBookmarked(bookmarked);
          }
          
          // Get related events (same category)
          const allEvents = await getAllEvents();
          const related = allEvents
            .filter(e => e.category === eventData.category && e.id !== eventData.id)
            .slice(0, 3);
          
          setRelatedEvents(related);
          
          // Set default pricing tier if the event has a price
          if (eventData.price && eventData.price > 0) {
            setSelectedTier({
              name: 'Standard',
              price: eventData.price,
              available: true
            });
          }
        } else {
          toast.error('Event not found');
          navigate('/events');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId, navigate, currentUser]);
  
  const handleRegister = async () => {
    // Ensure user is authenticated
    if (!currentUser || !currentUser.id) {
      toast.info('Please sign in to register for this event');
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }
    
    // If the event has a price, show payment modal
    if (event?.price && event.price > 0) {
      setShowPaymentModal(true);
    } else {
      try {
        // For free events, register directly
        if (!event) return;
        
        // Register user for the event in Firestore
        await registerUserForEvent(currentUser.id, event);
        
        // Update the event's attendee count - passing 1 to increment by 1
        await updateAttendeeCount(event.id, 1);
        
        // Update local state
        setIsRegistered(true);
        toast.success(`You have successfully registered for ${event.title}`);
      } catch (error) {
        console.error('Error registering for event:', error);
        toast.error('Failed to register for the event. Please try again.');
      }
    }
  };
  
  const validateCoupon = () => {
    if (!couponCode.trim()) return;
    
    setIsCouponChecking(true);
    
    // Simulate API call to validate coupon
    setTimeout(() => {
      // In a real app, this would be an API validation
      const validCoupon = Math.random() > 0.5; // Randomly determine if coupon is valid for demo
      
      if (validCoupon) {
        // Apply a random discount between 10-30%
        const discount = Math.floor(Math.random() * 20) + 10;
        setCouponDiscount(discount);
        setIsCouponValid(true);
        toast.success(`Coupon applied! ${discount}% discount`);
      } else {
        setCouponDiscount(0);
        setIsCouponValid(false);
        toast.error('Invalid or expired coupon code');
      }
      
      setIsCouponChecking(false);
    }, 1000);
  };
  
  const handlePayment = async () => {
    if (!event || !currentUser || !currentUser.id) return;
    
    setIsProcessingPayment(true);
    setPaymentError('');
    
    try {
      // In a real app, this would process payment through a payment gateway
      // For this demo, we'll simulate a payment process
      
      // Create payment details
      const paymentDetails = {
        amount: calculateFinalPrice(),
        ticketType: selectedTier?.name || 'Standard'
      };
      
      // Register user for the event in Firestore
      await registerUserForEvent(currentUser.id, event, paymentDetails);
      
      // Update the event's attendee count
      await updateAttendeeCount(event.id, 1);
      
      // Update local state and UI
      setShowPaymentModal(false);
      setIsRegistered(true);
      setIsProcessingPayment(false);
      toast.success(`Payment successful! You are now registered for ${event.title}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentError('Payment failed. Please try again or use a different payment method.');
      setIsProcessingPayment(false);
    }
  };
  
  const cancelPayment = () => {
    setShowPaymentModal(false);
    setCouponCode('');
    setCouponDiscount(0);
    setIsCouponValid(false);
  };
  
  const calculateFinalPrice = () => {
    if (!selectedTier) return 0;
    return selectedTier.price * (1 - couponDiscount / 100);
  };
  
  const handleBookmark = async () => {
    // Ensure user is authenticated
    if (!currentUser || !currentUser.id) {
      toast.info('Please sign in to bookmark this event');
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }
    
    if (!event) return;
    
    try {
      // Toggle bookmark status in Firestore
      const newBookmarkStatus = await toggleEventBookmark(currentUser.id, event.id);
      
      // Update local state
      setIsBookmarked(newBookmarkStatus);
      toast.success(newBookmarkStatus ? 'Event added to bookmarks' : 'Event removed from bookmarks');
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark. Please try again.');
    }
  };
  
  const handleShare = () => {
    if (navigator.share && event) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      })
      .then(() => console.log('Shared successfully'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      // We could copy the URL to clipboard here
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return new Date(dateString).toLocaleDateString('en-US', options);
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
  
  if (!event) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/events" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Back to Events
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10"></div>
          <img 
            src={event.imageUrl || event.image || 'https://via.placeholder.com/1200x400?text=Event+Image'} 
            alt={event.title} 
            className="w-full h-64 md:h-96 object-cover"
          />
          <div className="absolute bottom-0 left-0 z-20 p-4 md:p-8 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-primary-500 text-white text-xs px-3 py-1 rounded-full">
                {event.category}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                {formatDate(event.date)}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex items-center text-white/90 mb-4">
              <div className="flex items-center mr-4">
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.startTime} - {event.endTime}</span>
              </div>
            </div>
            <div className="flex items-center text-white/90">
              <span>Organized by {event.organizerName}</span>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">About Event</h2>
              <p className="text-gray-700 mb-6 whitespace-pre-line">{event.description}</p>
              
              {event.agenda && event.agenda.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">Event Agenda</h3>
                  <div className="border-l-2 border-primary-200 pl-4 space-y-4">
                    {event.agenda.map((item, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-6 mt-1 w-2 h-2 rounded-full bg-primary-500"></div>
                        <div className="font-medium">{item.time}</div>
                        <div className="text-gray-600">{item.activity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {event.requirements && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <p className="text-gray-700">{event.requirements}</p>
                </div>
              )}
            </div>
            
            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Similar Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedEvents.map(relatedEvent => (
                    <div key={relatedEvent.id} className="flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="w-1/3 bg-gray-200">
                        <img 
                          src={relatedEvent.imageUrl || relatedEvent.image || 'https://via.placeholder.com/100?text=Event'} 
                          alt={relatedEvent.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-2/3 p-3">
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{relatedEvent.title}</h3>
                        <div className="text-xs text-gray-500 mb-2">{formatDate(relatedEvent.date)}</div>
                        <Link 
                          to={`/events/${relatedEvent.id}`} 
                          className="text-primary-600 hover:text-primary-800 text-sm"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-20">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-lg font-semibold">Registration</h3>
                  <p className="text-gray-500 text-sm">
                    Deadline: {event.registrationDeadline ? formatDate(event.registrationDeadline) : 'Not specified'}
                  </p>
                </div>
                <div>
                  {event.price && event.price > 0 ? (
                    <span className="text-2xl font-bold text-primary-600">${event.price}</span>
                  ) : (
                    <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-lg">Free</span>
                  )}
                </div>
              </div>
              
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span>Available Spots</span>
                  <span>{event.attendeeCount} / {event.capacity || event.maxAttendees}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, ((event.attendeeCount || 0) / (event.capacity || event.maxAttendees || 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {!currentUser ? (
                  <Link 
                    to="/login" 
                    className="block w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-center rounded-lg transition-colors"
                  >
                    Sign in to Register
                  </Link>
                ) : isRegistered ? (
                  <button 
                    className="w-full py-2 px-4 bg-green-100 text-green-800 text-center rounded-lg cursor-default"
                    disabled
                  >
                    Already Registered
                  </button>
                ) : (
                  <Link 
                    to={`/events/${event.id}/register`}
                    className="block w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-center rounded-lg transition-colors"
                  >
                    Register Now
                  </Link>
                )}
                
                <button 
                  onClick={handleBookmark}
                  className={`w-full py-2 px-4 border rounded-lg transition-colors flex items-center justify-center ${
                    isBookmarked 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill={isBookmarked ? "currentColor" : "none"} 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={isBookmarked ? 0 : 2} 
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                    />
                  </svg>
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                
                <button 
                  onClick={handleShare}
                  className="w-full py-2 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Event Details</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(event.date)}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.startTime} - {event.endTime}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Organized by {event.organizerName}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Complete Registration</h3>
              <button 
                onClick={cancelPayment}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Event</span>
                  <span className="font-medium">{event.title}</span>
                </div>
                {selectedTier && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Ticket</span>
                    <span className="font-medium">{selectedTier.name}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{formatDate(event.date)}</span>
                </div>
                {isCouponValid && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount</span>
                    <span>-{couponDiscount}%</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${calculateFinalPrice().toFixed(2)}</span>
                </div>
              </div>
              
              {/* Coupon Code */}
              <div className="mb-4">
                <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Have a coupon code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="couponCode"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={isCouponValid || isCouponChecking}
                    placeholder="Enter code"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={!couponCode.trim() || isCouponValid || isCouponChecking}
                    className={`px-3 py-2 rounded-md ${
                      isCouponValid
                        ? 'bg-green-500 text-white cursor-default'
                        : isCouponChecking
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : !couponCode.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isCouponValid
                      ? 'Applied'
                      : isCouponChecking
                        ? 'Checking...'
                        : 'Apply'}
                  </button>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      paymentMethod === 'creditCard'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                    onClick={() => setPaymentMethod('creditCard')}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border ${
                        paymentMethod === 'creditCard'
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'creditCard' && (
                          <div className="w-2 h-2 rounded-full bg-white m-auto mt-0.5"></div>
                        )}
                      </div>
                      <span className="ml-2">Credit Card</span>
                    </div>
                  </div>
                  <div 
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      paymentMethod === 'paypal'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border ${
                        paymentMethod === 'paypal'
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'paypal' && (
                          <div className="w-2 h-2 rounded-full bg-white m-auto mt-0.5"></div>
                        )}
                      </div>
                      <span className="ml-2">PayPal</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mock Form Fields */}
              {paymentMethod === 'creditCard' && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        placeholder="MM/YY"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        placeholder="123"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentError && (
                <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
                  {paymentError}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelPayment}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  isProcessingPayment
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {isProcessingPayment ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay $${calculateFinalPrice().toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default EventDetailsPage; 