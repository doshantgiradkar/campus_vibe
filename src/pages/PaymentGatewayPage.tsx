import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { registerUserForEvent } from '../services/userService';

type PaymentData = {
  eventId: string;
  eventTitle: string;
  amount: number;
  paymentMethod: string;
  userData: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    zipCode?: string;
    specialRequirements?: string;
  };
};

export default function PaymentGatewayPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    // Get payment data from session storage
    try {
      const storedData = sessionStorage.getItem('paymentData');
      if (!storedData) {
        setError('No payment data found. Please try registering again.');
        setLoading(false);
        return;
      }

      const data = JSON.parse(storedData) as PaymentData;
      setPaymentData(data);
      
      // Pre-fill card holder name if available
      if (data.userData.name) {
        setCardDetails(prev => ({
          ...prev,
          cardHolder: data.userData.name
        }));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error retrieving payment data:', err);
      setError('Failed to load payment data');
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(.{2})/, '$1/')
        .slice(0, 5);
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // Format CVV (numbers only)
    if (name === 'cvv') {
      const formattedValue = value.replace(/\D/g, '').slice(0, 3);
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid card number');
      return false;
    }
    
    if (!cardDetails.cardHolder) {
      toast.error('Please enter the card holder name');
      return false;
    }
    
    if (!cardDetails.expiryDate || cardDetails.expiryDate.length < 5) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      toast.error('Please enter a valid CVV');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please login to complete payment');
      navigate('/login');
      return;
    }
    
    if (!paymentData) {
      toast.error('No payment data found');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setProcessing(true);
      
      // In a real application, you would integrate with a payment processor here
      // For this example, we'll simulate a successful payment
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Register user for the event with payment info
      await registerUserForEvent(currentUser.id, paymentData.eventId, {
        eventTitle: paymentData.eventTitle,
        paymentStatus: 'paid',
        paymentAmount: paymentData.amount,
        ticketType: 'regular'
      });
      
      // Clear payment data from session storage
      sessionStorage.removeItem('paymentData');
      
      // Show success message
      toast.success('Payment successful! You are now registered for the event.');
      
      // Redirect to event details page
      navigate(`/events/${paymentData.eventId}`);
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
          >
            <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Registration
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">Secure Payment</h1>
            <p className="mt-2 opacity-90">Complete your registration for {paymentData?.eventTitle}</p>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <div className="flex flex-wrap -mx-3">
                <div className="w-full md:w-2/3 px-3">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Summary</h2>
                    <p className="text-gray-600">You're registering for:</p>
                    <p className="font-medium text-lg text-gray-800">{paymentData?.eventTitle}</p>
                  </div>
                </div>
                <div className="w-full md:w-1/3 px-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Amount Due</h3>
                    <p className="text-2xl font-bold text-primary-600">${paymentData?.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {paymentData?.paymentMethod === 'card' ? 'Credit Card Payment' : 
                       paymentData?.paymentMethod === 'paypal' ? 'PayPal Payment' :
                       paymentData?.paymentMethod === 'apple' ? 'Apple Pay' : 'UPI Payment'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method: Credit Card</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.cardNumber}
                        onChange={handleInputChange}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Holder Name *
                    </label>
                    <input
                      type="text"
                      id="cardHolder"
                      name="cardHolder"
                      placeholder="John Doe"
                      value={cardDetails.cardHolder}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date (MM/YY) *
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={handleInputChange}
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Billing Address</h2>
                
                <div className="mb-4">
                  <p className="text-gray-600">Billing details will be used from your registration information:</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li><span className="font-medium">Name:</span> {paymentData?.userData.name}</li>
                    <li><span className="font-medium">Email:</span> {paymentData?.userData.email}</li>
                    <li><span className="font-medium">Phone:</span> {paymentData?.userData.phone}</li>
                    {paymentData?.userData.address && (
                      <li><span className="font-medium">Address:</span> {paymentData.userData.address}</li>
                    )}
                    {paymentData?.userData.city && paymentData?.userData.zipCode && (
                      <li>
                        <span className="font-medium">City/ZIP:</span> {paymentData.userData.city}, {paymentData.userData.zipCode}
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">Note</h3>
                    <div className="text-sm text-orange-700">
                      <p>This is a demo payment gateway. No actual payment will be processed.</p>
                      <p>For testing, use any valid-looking credit card information.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row-reverse sm:justify-between">
                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors ${
                    processing ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    `Pay $${paymentData?.amount.toFixed(2)}`
                  )}
                </button>
                
                <div className="flex items-center mt-4 sm:mt-0">
                  <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm text-gray-500">Secured by 256-bit encryption</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 