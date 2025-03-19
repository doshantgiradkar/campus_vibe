import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getEventById } from '../services/eventService';
import { registerUserForEvent } from '../services/userService';

// Payment method icons
const PAYMENT_ICONS = {
  card: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  paypal: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.217a.77.77 0 0 1 .757-.651h6.361c2.947 0 5.032 1.124 5.944 3.274.832 1.967.693 4.175-.401 6.088-.937 1.638-2.377 2.853-4.273 3.614a9.18 9.18 0 0 1-3.58.699h-2.08a.75.75 0 0 0-.738.627l-.858 4.47Zm-.1-1.873.447-2.34a1.982 1.982 0 0 1 1.941-1.635h2.08c1.03 0 2.016-.198 2.932-.588 1.633-.698 2.844-1.745 3.63-3.136.946-1.658 1.063-3.557.335-5.232-.775-1.823-2.542-2.746-5.096-2.746H7.98L5.238 19.464h1.738Z" />
      <path d="M16.912 8.123c.766 1.809.615 3.861-.437 5.715-.928 1.626-2.355 2.825-4.241 3.582a9.594 9.594 0 0 1-3.636.713H6.518a.75.75 0 0 0-.736.609l-.858 4.47c-.068.356-.38.609-.735.609H.595a.641.641 0 0 1-.633-.74l3.107-17.383a.77.77 0 0 1 .758-.651h6.356c2.955 0 5.043 1.124 5.944 3.274 0 0 .478 1.04.785 1.802Z" />
    </svg>
  ),
  apple: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.445 21.897a9.756 9.756 0 0 1-1.652.902c-.975.402-1.946.606-2.929.635a5.41 5.41 0 0 1-3.46-.928 4.098 4.098 0 0 1-1.433-1.559 4.516 4.516 0 0 1-.532-2.122c-.01-1.027.217-1.936.68-2.72a5.325 5.325 0 0 1 1.97-1.969c.722-.414 1.478-.63 2.275-.66.634.02 1.238.135 1.812.362.555.208 1.088.507 1.604.9-.141-.69-.25-1.245-.35-1.665-.275-1.13-.776-2.047-1.506-2.75-.662-.635-1.513-.965-2.557-.997-.663-.021-1.367.14-2.117.47-.758.31-1.195.473-1.31.494a2.691 2.691 0 0 1-.563.08c-.578-.007-1.068-.207-1.471-.593a1.964 1.964 0 0 1-.605-1.444c-.02-.523.162-.993.541-1.388.38-.393.846-.638 1.397-.723.371-.053.881-.086 1.525-.097.976.021 1.894.208 2.761.563a7.635 7.635 0 0 1 2.328 1.471c.147.136.295.29.445.46l.457.51c.135.175.25.36.342.55 1.592-1.918 3.513-2.888 5.775-2.908.584.01 1.104.097 1.573.266.456.164.85.41 1.17.733.33.32.494.723.494 1.207-.02.536-.204.988-.552 1.361-.37.363-.835.544-1.4.544-.195 0-.431-.027-.72-.085-.276-.066-.564-.095-.86-.095-.701.018-1.336.247-1.905.679-.557.44-.966.98-1.217 1.623-.219.519-.329 1.236-.329 2.152v.329l.041.64c.03.37.06.621.1.75.033.253.119.56.26.92h2.55c.74 0 1.264.065 1.573.192.349.146.623.379.827.7.204.31.304.652.304 1.024-.009.425-.131.783-.37 1.07a1.634 1.634 0 0 1-.912.476c-.243.043-.683.065-1.318.065h-3.256c-.263 1.388-.614 2.577-1.047 3.566m-.033-8.818c-.38 0-.77.134-1.171.393-.408.268-.724.63-.944 1.078-.193.379-.29.82-.29 1.323.01.483.107.891.3 1.228.188.357.476.634.87.835.392.208.828.31 1.311.31.483 0 .914-.102 1.297-.31a2.23 2.23 0 0 0 .9-.835c.192-.337.289-.745.289-1.228 0-.502-.097-.944-.29-1.323a2.15 2.15 0 0 0-.9-1.078c-.381-.259-.808-.393-1.275-.393h-.097Z" />
    </svg>
  ),
  upi: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  )
};

export default function EventRegistrationPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    specialRequirements: '',
    agreeToTerms: false
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        if (!eventId) {
          setError('Event ID is missing');
          setLoading(false);
          return;
        }

        const eventData = await getEventById(eventId);
        if (!eventData) {
          setError('Event not found');
          setLoading(false);
          return;
        }

        setEvent(eventData);
        
        // Pre-fill form with user data if available
        if (currentUser) {
          setFormData(prevData => ({
            ...prevData,
            name: currentUser.name || '',
            email: currentUser.email || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const applyCoupon = () => {
    // In a real app, you would validate the coupon code against a database
    if (couponCode === 'CAMPUS10') {
      setDiscount(10);
      toast.success('Coupon applied: 10% discount');
    } else if (couponCode === 'CAMPUS20') {
      setDiscount(20);
      toast.success('Coupon applied: 20% discount');
    } else {
      setDiscount(0);
      toast.error('Invalid coupon code');
    }
  };

  const calculateTotal = () => {
    if (!event || !event.price) return 0;
    const total = event.price;
    return total - (total * discount / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please login to register for this event');
      navigate('/login');
      return;
    }
    
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // For a free event, register directly
      if (!event.price || event.price === 0) {
        await registerUserForEvent(currentUser.id, event.id, {
          eventTitle: event.title,
          paymentStatus: 'free'
        });
        
        toast.success('Successfully registered for the event!');
        navigate(`/events/${eventId}`);
        return;
      }
      
      // For paid events, proceed to payment
      const paymentData = {
        eventId: event.id,
        eventTitle: event.title,
        amount: calculateTotal(),
        paymentMethod,
        userData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          specialRequirements: formData.specialRequirements
        }
      };
      
      // Store payment data in session storage for the payment page
      sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
      
      // Navigate to payment gateway
      navigate('/payment-gateway');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Failed to register for the event');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="bg-red-50 p-4 rounded-lg inline-block">
            <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/events')}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
          >
            <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Event
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">Register for Event</h1>
            <p className="mt-2 opacity-90">{event?.title}</p>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap -mx-3 mb-8">
              <div className="w-full md:w-2/3 px-3">
                <div className="rounded-lg bg-gray-50 p-4 mb-4">
                  <h2 className="font-semibold text-gray-800 text-lg mb-2">Event Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">{event?.date} • {event?.startTime} - {event?.endTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{event?.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Organizer</p>
                      <p className="font-medium">{event?.organizerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{event?.category}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/3 px-3">
                <div className="rounded-lg bg-gray-50 p-4 mb-4">
                  <h2 className="font-semibold text-gray-800 text-lg mb-2">Price</h2>
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Registration Fee</p>
                    <p className="font-medium text-lg">
                      {event?.price ? `$${event.price.toFixed(2)}` : 'Free'}
                    </p>
                  </div>
                  
                  {event?.price > 0 && (
                    <>
                      <div className="mb-2">
                        <p className="text-sm text-gray-500">Discount</p>
                        <p className="font-medium text-green-600">{discount > 0 ? `-${discount}%` : 'None'}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-bold text-xl">${calculateTotal().toFixed(2)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requirements or Accommodations
                    </label>
                    <textarea
                      id="specialRequirements"
                      name="specialRequirements"
                      rows={3}
                      value={formData.specialRequirements}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Any dietary restrictions, accessibility needs, etc."
                    ></textarea>
                  </div>
                </div>
              </div>

              {event?.price > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Information</h2>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {['card', 'paypal', 'apple', 'upi'].map(method => (
                        <div 
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                            paymentMethod === method 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <div className={`${paymentMethod === method ? 'text-primary-600' : 'text-gray-500'}`}>
                              {PAYMENT_ICONS[method as keyof typeof PAYMENT_ICONS]}
                            </div>
                            <span className="mt-2 text-sm font-medium capitalize">
                              {method === 'card' ? 'Credit Card' : method}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter coupon code"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-r-md hover:bg-gray-300 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Try CAMPUS10 or CAMPUS20 for a discount</p>
                  </div>
                </div>
              )}

              <div className="flex items-start mb-6">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                    I agree to the terms and conditions *
                  </label>
                  <p className="text-gray-500">
                    By registering, you agree to our{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-800">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-800">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors ${
                    isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : event?.price > 0 ? (
                    'Proceed to Payment'
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 