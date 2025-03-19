import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

interface PaymentRecord {
  eventId: string;
  eventTitle: string;
  amount: number;
  date: string;
  tier: string;
  couponApplied: string | null;
}

export default function PaymentHistoryPage() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPaymentHistory = () => {
      setIsLoading(true);
      
      // In a real app, this would be an API call to get the user's payment history
      setTimeout(() => {
        const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
        setPaymentHistory(history);
        setIsLoading(false);
      }, 500);
    };
    
    fetchPaymentHistory();
  }, [currentUser]);
  
  const sortedPayments = [...paymentHistory].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
  });
  
  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate total spent
  const totalSpent = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  
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
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-1">
            View and manage your payment records for events
          </p>
        </div>
        
        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-r border-gray-200 pr-6">
              <h2 className="text-sm font-medium text-gray-500">Total Spent</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="border-r border-gray-200 px-6">
              <h2 className="text-sm font-medium text-gray-500">Payments Made</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">{paymentHistory.length}</p>
            </div>
            <div className="pl-6">
              <h2 className="text-sm font-medium text-gray-500">Last Payment</h2>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {paymentHistory.length > 0 
                  ? formatDate(paymentHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date) 
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
        
        {paymentHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-medium text-gray-900 mb-2">No Payment History</h2>
            <p className="text-gray-600 mb-6">
              You haven't made any payments for events yet.
            </p>
            <Link 
              to="/events" 
              className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <>
            {/* Payment Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Payment Records</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('amount')}
                      >
                        <div className="flex items-center">
                          Amount
                          {sortBy === 'amount' && (
                            <svg className={`ml-1 w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('date')}
                      >
                        <div className="flex items-center">
                          Date
                          {sortBy === 'date' && (
                            <svg className={`ml-1 w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedPayments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link 
                            to={`/events/${payment.eventId}`}
                            className="hover:text-primary-600 transition-colors"
                          >
                            {payment.eventTitle}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="font-medium text-primary-600">${payment.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(payment.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.tier}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="text-primary-600 hover:text-primary-800 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Download or Print Buttons */}
            <div className="flex justify-end space-x-4 mb-8">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </>
        )}
        
        {/* Link to browse events */}
        <div className="mt-8 text-center">
          <Link 
            to="/events" 
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            Browse more events
          </Link>
        </div>
      </div>
      
      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Receipt ID:</span>
                <span className="font-medium">#{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Date:</span>
                <span>{formatDate(selectedPayment.date)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Payment Method:</span>
                <span>Credit Card</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Completed</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Event Details</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900 mb-1">{selectedPayment.eventTitle}</p>
                <p className="text-sm text-gray-600 mb-2">Ticket Type: {selectedPayment.tier}</p>
                {selectedPayment.couponApplied && (
                  <p className="text-sm text-green-600">Coupon Applied: {selectedPayment.couponApplied}</p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Payment Summary</h3>
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${selectedPayment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>${selectedPayment.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // In a real app, this would generate or download a receipt
                  alert('Receipt download would start here');
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 