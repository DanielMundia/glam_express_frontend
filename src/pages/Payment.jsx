import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CreditCardIcon, CheckIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import Header from "../components/Header";
import PropTypes from "prop-types";
import "../styles/payment.css"

export default function Payment () {
    const {user} = useAuth();
    const navigate=useNavigate();
    const [searchParams]=useSearchParams();

    // Get BookingId from URL parameters
    const bookingId=searchParams.get('bookingId');

    // State Management
    const [booking, setBooking]=useState(null);
    const [phone, setPhone]=useState('');
    const [loading, setLoading]=useState(false);
    const [error, setError]=useState('');
    const [success, setSuccess]=useState('');
    const [payment, setPayment]=useState(null);
    const [paymentStatus, setPaymentStatus]=useState('');
    const [isProcessing, setIsProcessing]=useState(false);
    const [isVerifying, setIsVerifying]=useState(false);
    const [paymentTimeout, setPaymentTimeout]=useState(false);
    const [paymentHistory, setPaymentHistory]=useState([]);

    // Dateformatiing function
    const formatDate = (dateString)=>{
        return dateString ? new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A';
    };

    // Currency Formatting Function
    const formatCurrency = (amount)=>{
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };


    console.log('Payment component initialized');
    console.log('Current user:', user);
    console.log('Booking ID from URL:', bookingId);


    // Fetch Booking details upon navigation to page
    useEffect(()=>{
        const fetchBookingsDetails = async()=>{
            if (!bookingId) {
                console.log('No booking ID provided, redirecting to Bookings');
                setError('No booking ID provided');
                navigate('/bookings');
                return null;
            }
            try {
                setLoading(true);
                setError('');
                console.log('Fetching Booking details for ID:', bookingId);
                const response=await axios.get(
                    `https://glam-express-backend.onrender.com/api/bookings/${bookingId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log('Bookings response:', response.data);
                const foundBooking=response.data.data;
                if (foundBooking && foundBooking.customerId === user.id) {
                    setBooking(foundBooking);
                    console.log('Booking Found:', foundBooking);

                    // Check if payment is already completed
                    if (foundBooking.paymentStatus === 'paid') {
                        setPaymentStatus('completed');
                        setSuccess('Payment already completed for this booking');
                        console.log('Payment already completed for booking');
                    }
                } else {
                    console.log('Booking not found in user bookings');
                    setError('Booking Not Found or authorised');
                    navigate('/bookings');
                }
            } catch (error) {
                console.error('Error fetching booking details:', error);
                setError(error.response?.data?.message || 'Failed to fetch booking details');
                console.log("Failure in fetching Booking details")
            } finally {
                setLoading(false);
            }
        };
        if (user?.token && user?.id && bookingId) {
            fetchBookingsDetails();
        }
    }, [user?.token, bookingId, user?.id, navigate]);

    // Fetch Payment History
    useEffect(()=>{
        const fetchPaymentHistory=async()=>{
            try {
                const res=await axios.get(
                    `https://glam-express-backend.onrender.com/api/payments`,
                    {
                        headers: {
                                Authorization: `Bearer ${user.token}`,
                        },
                    }
                );
                setPaymentHistory(res.data.data || []);
            } catch (error) {
                console.error("Failed to fetch Payment History:", error);
            }
        };
        if (user?.token) {
            fetchPaymentHistory();
        }
    }, [user?.token]);

    // Payment Timeout Effect
    useEffect(()=>{
        const timer=setTimeout(()=>{
            if (paymentStatus === 'pending') {
                setPaymentTimeout(true);
                setError('Payment Timeout. Please Try Again');
                console.log('Payment Timeout. Please Try Again');
            }
        }, 300000); // 5 Minutes Timeout
        return()=>clearTimeout(timer);
    }, [paymentStatus]);

    // Handle phone number input
    const handlePhoneChange = (e) => {
        let value=e.target.value;
        // Remove any non-numeric character except +
        value = value.replace(/[^0-9+]/g, '');
        // Format Kenyan Phone Number
        if (value.startsWith('0')) {
            value='+254' + value.substring(1);
        } else if (value.startsWith('254')) {
            value = '+' + value;
        } else if (!value.startsWith('+254') && value.length > 0 && !value.startsWith('+')) {
            value='254' + value;
        }
        setPhone(value);
        console.log('Phone Number Updated:', value);
    };

    // Process M-pesa Payment
    const handlePayment=async(e)=>{
        e.preventDefault();
        if (!/^\+254\d{9}$/.test(phone)) {
            setError('Please enter a valid phone number');
            console.log('Invalid Phone Number:', phone);
            return;
        }
        try {
            setIsProcessing(true);
            setLoading(true);
            setError('');
            setSuccess('');
            console.log('Initializing M-pesa Payment...');
            console.log('Payment details:', {bookingId, phone, amount: booking.amount});
            const response=await axios.post(
                'https://glam-express-backend.onrender.com/api/payments',
                {
                    bookingId: bookingId,
                    phone: phone
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Payment response:', response.data);
            if (response.data.success) {
                setPayment(response.data.data);
                setSuccess('Payment initiated successfully! Please check your phone for M-pesa prompt.');
                setPaymentStatus('pending');
                console.log('Payment Initiated successfully:', response.data.data);

                // Start verification process after a delay
                const timer=setTimeout(()=>{
                    handleVerifyPayment(response.data.data._id);
                }, 5000); // Wait 5 seconds before starting verification
                return()=>clearTimeout(timer);
            } else {
                console.log('Payment initiation failed:', response.data.message);
                setError(response.data.message || 'Failed to initiate payment');
            }
        } catch (error) {
            console.error('Payment error:', error);
            setError(error.response?.data?.message || 'Failed to process payment');
        } finally {
            setIsProcessing(false);
            setLoading(false);
        }
    };

    // Verify payment status
    const handleVerifyPayment=async(paymentId)=>{
        try {
            setIsVerifying(true);
            console.log('Verifying payment with ID:', paymentId);
            const response=await axios.get(
                `https://glam-express-backend.onrender.com/api/payments/${paymentId}/verify`,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Verification response:', response.data);
            if (response.data.success) {
                const verifiedPayment=response.data.data;
                setPayment(verifiedPayment);
                if (verifiedPayment.status === 'completed') {
                    setPaymentStatus('completed');
                    setSuccess('Payment completed successfully!');
                    setError('');
                    console.log('Payment verified as completed');

                    // Update booking state
                    setBooking(prev=>({ ...prev, paymentStatus: 'paid'}));
                } else if (verifiedPayment.status === 'failed') {
                    setPaymentStatus('failed');
                    setError('Payment failed. Please try again.');
                    setSuccess('');
                    console.log('Payment verification failed');
                } else {
                    setPaymentStatus('pending');
                    console.log('Payment still pending will retry verification');

                    // Retry verification after 10 seconds if still pending
                    const timer=setTimeout(()=>{
                        handleVerifyPayment(paymentId);
                    }, 10000);
                    return()=>clearTimeout(timer) // Cleanup
                }
            } else {
                console.log('Payment verification request failed:', response.data.message);
                setError(response.data.message || 'Failed to verify payment');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError(error.response?.data?.message || 'Failed to verify payment');
        } finally {
            setIsVerifying(false);
        }
    };

    // Manual verification trigger
    const handleManualVerify=()=>{
        if (payment?._id) {
            console.log('Manual verification triggered');
            handleVerifyPayment(payment._id);
        }
    };
    // Navigate back to bookings
    const handleBackToBookings=()=>{
        console.log('Navigating back to bookings');
        navigate('/bookings');
    };

    // Loading State
    if (loading && !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Payment Details...</p>
                </div>
            </div>
        );
    }

    // Error state - no booking
    if (!booking && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
                    <p className="text-gray-600 mb-6">The booking you are trying to pay for could not be found</p>
                    <button
                        onClick={handleBackToBookings}
                        className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                    >
                        Back To Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <Header />
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center mb-4">
                        <CreditCardIcon className="h-8 w-8 text-pink-600 mr-3" />
                        <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
                    </div>

                    {/* Booking Details */}
                    <div className="border-t py-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Service:</span>
                                <p className="font-medium">{booking?.service}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Type:</span>
                                <p className="font-medium capitalize">{booking?.serviceType}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Date:</span>
                                <p className="font-medium">{formatDate(booking?.date)}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Amount:</span>
                                <p className="font-bold text-lg text-pink-600">{formatCurrency(booking?.amount)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Status */}
                {paymentStatus === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <CheckIcon className="h-6 w-6 text-green-600 mr-3"/>
                            <div>
                                <h3 className="text-green-800 font-semibold">Payment Completed!</h3>
                                <p className="text-green-700">Your Payment Has Been Completed Successfully!</p>
                                {payment && (
                                    <p className="text-sm text-green-600 mt-1">
                                        M-Pesa Code: {payment.mpesaCode}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {paymentStatus === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <ClockIcon className="h-6 w-6 text-yellow-600 mr-3" />
                            <div>
                                <h3 className="text-yellow-800 font-semibold">Payment Pending</h3>
                                <p  className="text-yellow-700">
                                    {isVerifying ? 'Verifying Payment...' : 'Please Complete Mpesa transaction on your Phone'}
                                </p>
                                {payment && (
                                    <p className="text-sm text-yellow-600 mt-1">
                                        M-Pesa Code: {payment.mpesaCode}
                                    </p>
                                )}

                                {/* Verification Loading Indicator */}
                                {isVerifying && (
                                    <div className="flex items-center mt-2">
                                        <div className="animate-spin h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                                        <span className="text-sm">Verifying...</span>
                                </div>
                                )}
                            </div>
                        </div>
                        {!isVerifying && (
                            <button
                                onClick={handleManualVerify}
                                className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                            >
                                Check Payment Status
                            </button>
                        )}
                    </div>
                )}

                {paymentStatus === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <XMarkIcon className="h-6 w-6 text-red-600 mr-3" />
                            <div>
                                <h3 className="text-red-800 font-semibold">Payment Failed</h3>
                                <p className="text-red-700">The Payment Could Not Be Processed. Please Try Again</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Payment Timeout */}
                {paymentTimeout && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-700">
                            Payment Timeout Please Try Again...
                        </p>
                    </div>
                )}

                {/* Success Message */}
                {success && !paymentStatus && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                {/* Payment Form */}
                {paymentStatus !== 'completed' && booking?.paymentStatus !== 'paid' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">M-Pesa Payment</h3>

                        <form onSubmit={handlePayment}>
                            <div className="mb-6">
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="+254712345678"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        required
                                        disabled={isProcessing || loading}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter Your M-Pesa Registered Phone Number
                                    </p>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={isProcessing || loading || !phone || paymentTimeout}
                                    className="flex-1 bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        `Pay ${formatCurrency(booking?.amount)}`
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBackToBookings}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">How To Pay:</h4>
                            <ol className="text-sm text-blue-800 space-y-1">
                                <li>1. Enter Your M-pesa registered Phone Number</li>
                                <li>2. Click "Pay" to initiate the payment</li>
                                <li>3. You'll receive an Mpesa Prompt on your Phone</li>
                                <li>4. Enter your M-Pesa PIN to complete the payment</li>
                                <li>5. Payment will be verified automatically</li>
                            </ol>
                        </div>
                    </div>
                )}

                {/* Payment History */}
                {paymentHistory.length>0 &&(
                    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Booking ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            M-Pesa Code
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paymentHistory.map((payment)=> (
                                        <tr key={payment._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.bookingId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(payment.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(payment.timestamp)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.mpesaCode}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-6 text-center">
                    <button
                        onClick={handleBackToBookings}
                        className="text-pink-600 hover:text-pink-700 font-medium"
                    >
                        ← Back to Bookings
                    </button>
                </div>
            </div>
        </div>
    );
}
// Prop type Validation
Payment.propTypes ={
    bookingId: PropTypes.string
};