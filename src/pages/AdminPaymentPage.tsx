import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { toast } from 'react-toastify';
import { 
  PaymentRecord, 
  PricingTier, 
  EventPricing, 
  getAllPayments, 
  getAllEventPricing, 
  updatePayment,
  saveEventPricing
} from '../services/paymentService';
import { Timestamp } from 'firebase/firestore';

type PaymentStatus = 'all' | 'completed' | 'refunded' | 'pending';

export default function AdminPaymentPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [eventPricing, setEventPricing] = useState<EventPricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventPricing | null>(null);
  const [filterStatus, setFilterStatus] = useState<PaymentStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch payments from Firestore
      const fetchedPayments = await getAllPayments();
      setPayments(fetchedPayments);
      
      // Fetch event pricing from Firestore
      const fetchedEventPricing = await getAllEventPricing();
      setEventPricing(fetchedEventPricing);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load payment data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      payment.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleRefund = async (payment: PaymentRecord) => {
    try {
      // Update payment status to refunded in Firestore
      await updatePayment(payment.id, { status: 'refunded' });
      
      // Update local state
      const updatedPayments = payments.map(p => 
        p.id === payment.id ? { ...p, status: 'refunded' as const } : p
      );
      setPayments(updatedPayments);
      
      toast.success('Payment refunded successfully');
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund. Please try again.');
    }
  };

  const handleUpdatePricing = async (eventId: string, updatedTiers: PricingTier[]) => {
    try {
      // Find the event pricing to update
      const eventToUpdate = eventPricing.find(e => e.eventId === eventId);
      
      if (!eventToUpdate) {
        toast.error('Event pricing not found');
        return;
      }
      
      // Update event pricing in Firestore
      const updatedEventPricing = {
        ...eventToUpdate,
        pricingTiers: updatedTiers
      };
      
      await saveEventPricing({
        eventId: updatedEventPricing.eventId,
        eventTitle: updatedEventPricing.eventTitle,
        pricingTiers: updatedEventPricing.pricingTiers,
        validCoupons: updatedEventPricing.validCoupons
      });
      
      // Update local state
      const updatedEvents = eventPricing.map(event =>
        event.id === eventToUpdate.id ? { ...event, pricingTiers: updatedTiers } : event
      );
      setEventPricing(updatedEvents);
      
      toast.success('Event pricing updated successfully');
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error('Failed to update pricing. Please try again.');
    }
  };

  const formatDate = (timestamp: Timestamp | Date | string) => {
    if (!timestamp) return '';
    
    // Handle different timestamp types
    let date: Date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else {
      date = new Date();
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">
            Manage payments, refunds, and event pricing
          </p>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="border-r border-gray-200 pr-6">
              <h2 className="text-sm font-medium text-gray-500">Total Revenue</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </p>
            </div>
            <div className="border-r border-gray-200 px-6">
              <h2 className="text-sm font-medium text-gray-500">Completed Payments</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="border-r border-gray-200 px-6">
              <h2 className="text-sm font-medium text-gray-500">Refunded Payments</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'refunded').length}
              </p>
            </div>
            <div className="pl-6">
              <h2 className="text-sm font-medium text-gray-500">Pending Payments</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Management */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-900">Payment Records</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as PaymentStatus)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="refunded">Refunded</option>
                  <option value="pending">Pending</option>
                </select>
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.eventTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'refunded' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-primary-600 hover:text-primary-800 mr-3"
                      >
                        View Details
                      </button>
                      {payment.status === 'completed' && (
                        <button
                          onClick={() => handleRefund(payment)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Pricing Management */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Event Pricing</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {eventPricing.map((event) => (
                <div key={event.eventId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{event.eventTitle}</h3>
                      <p className="text-sm text-gray-500">Event ID: {event.eventId}</p>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      Edit Pricing
                    </button>
                  </div>
                  <div className="space-y-3">
                    {event.pricingTiers.map((tier, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{tier.name}</p>
                          {tier.benefits && (
                            <p className="text-sm text-gray-500">{tier.benefits}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900">${tier.price.toFixed(2)}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            tier.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {tier.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Valid Coupons</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.validCoupons.map((coupon, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {coupon}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  selectedPayment.status === 'completed' ? 'text-green-600' :
                  selectedPayment.status === 'refunded' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </span>
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
                  <span className="text-gray-600">Amount</span>
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
              {selectedPayment.status === 'completed' && (
                <button
                  onClick={() => handleRefund(selectedPayment)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Process Refund
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event Pricing Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Event Pricing</h2>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">{selectedEvent.eventTitle}</h3>
              <div className="space-y-4">
                {selectedEvent.pricingTiers.map((tier, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => {
                          const updatedTiers = [...selectedEvent.pricingTiers];
                          updatedTiers[index] = { ...tier, name: e.target.value };
                          setSelectedEvent({ ...selectedEvent, pricingTiers: updatedTiers });
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Tier name"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => {
                          const updatedTiers = [...selectedEvent.pricingTiers];
                          updatedTiers[index] = { ...tier, price: parseFloat(e.target.value) };
                          setSelectedEvent({ ...selectedEvent, pricingTiers: updatedTiers });
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Price"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={tier.available}
                          onChange={(e) => {
                            const updatedTiers = [...selectedEvent.pricingTiers];
                            updatedTiers[index] = { ...tier, available: e.target.checked };
                            setSelectedEvent({ ...selectedEvent, pricingTiers: updatedTiers });
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-600">Available</span>
                      </label>
                    </div>
                    <button
                      onClick={() => {
                        const updatedTiers = selectedEvent.pricingTiers.filter((_, i) => i !== index);
                        setSelectedEvent({ ...selectedEvent, pricingTiers: updatedTiers });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  setSelectedEvent({
                    ...selectedEvent,
                    pricingTiers: [
                      ...selectedEvent.pricingTiers,
                      { name: 'New Tier', price: 0, available: true }
                    ]
                  });
                }}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Tier
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Valid Coupons</h3>
              <div className="flex flex-wrap gap-2">
                {selectedEvent.validCoupons.map((coupon, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-sm text-blue-800">{coupon}</span>
                    <button
                      onClick={() => {
                        const updatedCoupons = selectedEvent.validCoupons.filter((_, i) => i !== index);
                        setSelectedEvent({ ...selectedEvent, validCoupons: updatedCoupons });
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                  Add Coupon
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdatePricing(selectedEvent.eventId, selectedEvent.pricingTiers);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 