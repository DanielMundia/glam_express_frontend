import { useState, useEffect } from "react";
import {useAuth} from '../context/AuthContext';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {CalendarIcon, CheckIcon, XMarkIcon, ChatBubbleLeftRightIcon} from '@heroicons/react/24/outline';
import "../styles/booking.css";
import BookingNegotiation from "../components/BookingNegotiation";
import ReviewCard from "../components/ReviewCard";

export default function Bookings() {
    const {user}=useAuth();
    console.log('Current User Token:', user?.token);
    const [bookings, setBookings]=useState(null);
    const [loading, setLoading]=useState(true);
    const [error, setError]=useState('');
    const [success, setSuccess]=useState('');
    const [showNegotiationForBookingId, setShowNegotiationForBookingId]=useState(null);
    const [showReviewForBookingId, setShowReviewForBookingId]=useState(null);
    const [hasReviewed, setHasReviewed]=useState({});
    const navigate=useNavigate();

    useEffect(()=> {
        const fetchBookings = async ()=>{
            console.log('Fetching With Token:', user?.token);
            try {
                setLoading(true);
                setError('');
                setSuccess('');
                const endpoint = '/api/bookings';

                const res=await axios.get(`https://glam-express-backend.onrender.com${endpoint}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (res.data.success) {
                    setBookings(res.data.data || []);
                    setSuccess("Successfully loaded bookings")
                    console.log("Bookings loaded successfully")
                } else {
                    setError(res.data.message || 'Failed to Load Bookings');
                    console.log("Could not Load Bookings");
                }
            } catch (error) {
                console.error('Booking fetch error:', error);
                if (error.response?.status === 401) {
                    // Token is invalid - possibly expired
                    setError('Your Session Has Expired. Please Log in  Again');
                    // Optionally redirect To Login
                    navigate('/login');
                } else {
                    setError(error.message || 'Failed To Load Bookings');
                }
            } finally {
                setLoading(false);
            }
        };
        if (user?.token) {
            fetchBookings();
        }
    }, [user?.token, navigate]);

    useEffect(() => {
    bookings?.forEach(booking => {
        console.log(`Booking ${booking._id}:`, {
            status: booking.status,
            negotiationStatus: booking.negotiationStatus,
            paymentStatus: booking.paymentStatus
        });
    });
    }, [bookings]);

    const formatDate=(dateString)=>{
        const options={
            weekday:'short',
            year:'numeric',
            month:'short',
            day:'numeric',
            hour:'2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US',options);
    };

    const handleStatusChange=async(bookingId, newStatus)=>{
        try {
            const validStatuses=['confirmed', 'rejected', 'cancelled', 'completed'];
            if (!validStatuses.includes(newStatus)) {
                throw new Error('Invalid Status');
            }
            const res=await axios.patch(
                `https://glam-express-backend.onrender.com/api/bookings/${bookingId}`,
                {status: newStatus},
                {headers: {Authorization: `Bearer ${user.token}`}}
            );
            if (res.data.success) {
                setBookings(bookings.map(b=>
                    b._id===bookingId?{...b, status: newStatus} : b
                ));
                setSuccess(`Booking ${newStatus} Successfully`);
                console.log(`Successfully ${newStatus} your booking`);
            } else {
                setError(res.data.message || 'Failed To Update Booking');
                console.log("Booking Updating Failed");
            }
        } catch (error) {
            console.error('Status Change Error:', error);
            setError(error.response?.data?.message || 'Failed To update Booking');
            console.log(`Booking has failed ${newStatus}`);
        }
    };

    const handleRemoveBooking=async(bookingId)=> {
        try {
            const res=await axios.delete(
                `https://glam-express-backend.onrender.com/api/bookings/${bookingId}`,
                {headers: {Authorization: `Bearer ${user.token}`}}
            );
            if (res.data.success) {
                setBookings(bookings.filter(b => b._id !== bookingId));
                setSuccess('Booking Removed Successfully');
                console.log('Booking Removed Successfully');
            } else {
                setError(res.data.message || 'Failed to remove booking');
            }
        } catch (error) {
            console.error('Remove Booking error:', error);
            setError(error.response?.data?.message || 'Failed To Remove Booking');
        }
    };

    const isBookingExpired=(booking)=>{
        if (!['paid','cancelled','rejected','completed'].includes(booking.status)) {
            return false;
        }
        const bookingDate=new Date(booking.createdAt);
        const thirtyDaysAgo=new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return bookingDate < thirtyDaysAgo
    };

    const handleCreateReview=async(bookingId, rating, comment)=> {
        try {
            const res=await axios.post(
                `https://glam-express-backend.onrender.com/api/reviews`,
                {bookingId, rating, comment},
                {headers: {Authorization: `Bearer ${user.token}`}}
            );
            if (res.data.success) {
                setSuccess('Review Submitted Successfully!');
                alert('Review successfully submitted');
                console.log('Reviewed successfully');
                setHasReviewed(prev => ({...prev, [bookingId]: true}));
                setShowReviewForBookingId(null);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed To Submit Review');
            console.log('Review failure to Submit', error);
        }
    };

    const handleNegotiateClick = (bookingId) => {
        setShowNegotiationForBookingId(bookingId);
    };

    const handleNegotiationComplete=(bookingId, updatedBooking) =>{
        console.log('DEBUG: [handleNegotiationComplete] Received:', {
            bookingId,
            updatedBooking
        });

        if (!updatedBooking) {
            console.error('Updated booking is undefined');
            setError('Failed to update booking - Please Refresh and try again');
            return;
        }
        // Update the booking in the state and hide the negotiation component
        setBookings(bookings.map((b) => 
            b?._id === bookingId ? { 
                ...b,
                ...updatedBooking,
                negotiatedDate: updatedBooking.proposedChanges?.date ||  b.negotiatedDate,
                negotiatedServiceType: updatedBooking.proposedChanges?.serviceType || b.negotiatedServiceType,
                negotiatedService: updatedBooking.proposedChanges?.service || b.negotiatedService,
                status: updatedBooking.status || 'accepted',
                negotiationStatus: updatedBooking.negotiationStatus || 'completed'
            } : b));
        setShowNegotiationForBookingId(null);
        setSuccess("Negotiation Concluded Successfully!");
    };

    const handleCancelNegotiation=(bookingId) => {
        // Simple hide the negotiation component
        setShowNegotiationForBookingId(null);
        setError("") // Clear any negotiation related errors
        console.log("Negotiation Cancel Successfully");
        setSuccess(""); // Clear any negotiation related success messages
    }

    const handleProposedChangesUpdate=(bookingId, updatedBooking)=> {
        // This is called when changes are proposed (not accepted/rejected yet)
        // We update the specific booking in the state to reflect the proposed changes immediately
        setBookings(
            bookings.map((b)=>(b._id === bookingId ? updatedBooking : b))
        );
    };

    if (loading || bookings===null) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    console.log('Current bookings state:', bookings);
    console.log('Bookings array length:', bookings?.length);
    console.log('First booking item:', bookings?.[0]);
    console.log('First booking status:', bookings?.[0]?.status);

    return (
        <div className="bookings-page">
            <div className="bookings-container">
                <div className="page-header">
                    <h1 className="page-title">
                        {user?.role === 'beautician' ? 'My Appointments' : 'My Bookings'}
                    </h1>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div> }


                {bookings.length === 0 ? (
                        <div className="empty-state">
                            <CalendarIcon className="empty-state-icon" />
                            <h3 className="empty-state-title">{user?.role === 'beautician' ? 'No Appointments' : 'No Bookings Yet'}</h3>
                            <p className="empty-state-description">{user?.role === 'beautician' ? 'Your upcomming appointments will appear here' : 'Book your first beauty service to get started!'}</p>
                            <a href={user?.role === 'beautician' ? '/beauticiandashboard' : '/beauticians'} className="empty-state-button">
                                {user?.role === 'beautician' ? 'Back To Dashboard' : 'Find a Beautician'}
                            </a>
                        </div>
                    ): ( 
                    <div className="bookings-list">
                        {bookings.filter(booking=> !isBookingExpired(booking)).map(booking=> {
                            if (!booking) return null;

                            return (
                        
                            <div key={booking._id} className={`booking-item ${booking.status}`}>
                                <div className="booking-header">
                                    {(booking.paymentStatus === 'paid' || booking.status === 'cancelled' || booking.status === 'rejected') && (
                                        <button
                                            onClick={()=>handleRemoveBooking(booking._id)}
                                            className="remove-booking-btn"
                                            title="Remove This Booking"
                                        >
                                            <XMarkIcon className="h-5 w-5"/>
                                        </button>
                                    )}
                                    <div className="booking-service">
                                        {Array.isArray(booking.services) && booking.services.length > 0 ? (
                                            <ul className="booking-services-list">
                                            {booking.services.map((service, idx) => (
                                                <li key={idx}>
                                                {service.name} {service.price ? `(KES ${service.price})` : ''}
                                                </li>
                                            ))}
                                            </ul>
                                        ) : (
                                            <span>No services selected</span>
                                        )}
                                        <span className={`booking-status ${booking.status}`}>
                                            {booking.status}
                                        </span>
                                        {booking.paymentStatus === 'paid' ? (
                                            <span className="payment-badge paid">Paid</span>
                                        ) : (booking.status === 'cancelled' || booking.status === 'rejected') ? (
                                            <span className="payment-badge cancelled">Booking {booking.status}</span>
                                        ) : (
                                            <span className="payment-badge unpaid">
                                                {booking.status === 'completed' ? 'Payment Required' : 'Pending Payment'}
                                            </span>
                                        )}
                                    </div>
                                    {user?.role === 'customer' &&
                                        booking?.paymentStatus !== 'paid' && 
                                        (booking.status === 'accepted' || booking?.status === 'confirmed' || booking?.status === 'completed') &&
                                        booking.status !== 'cancelled' &&
                                        booking.status !== 'rejected' && (
                                            <button
                                                onClick={()=>navigate(`/payment?bookingId=${booking._id}`)}
                                                className="pay-button"
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                    {user?.role === 'customer' &&
                                        booking?.status !== 'cancelled' && booking?.status !== 'rejected' &&
                                        (booking.status ==='accepted' || booking.status === 'confirmed' || booking?.status==='completed') &&
                                        !hasReviewed[booking._id] && (
                                        <button
                                            onClick={()=>setShowReviewForBookingId(booking._id)}
                                            className="review-button"
                                        >
                                            Rate & Review
                                        </button>
                                    )}

                                    {user?.role === 'beautician' ? (
                                        <div className="booking-actions">
                                            {booking.status === 'pending' && (
                                                <>  
                                                    <button
                                                        onClick={()=>handleStatusChange(booking._id, 'confirmed')}
                                                        className="confirm-button"
                                                    >
                                                        <CheckIcon className="h-4 w-4" />
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(booking._id, 'rejected')}
                                                        className="reject-button"
                                                    >
                                                        <XMarkIcon className="h-4 w-4"/>
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={()=>handleNegotiateClick(booking._id)}
                                                        className={`negotiation-btn-list ${booking.negotiationStatus !== 'initial' ? 'negotiation-indicator' : ''}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                        </svg>
                                                        {booking.negotiationStatus === 'initial' ? 'Negotiate' : 'View Negotiation'}
                                                    </button>
                                                </>
                                            )}
                                            {(booking.status === 'accepted' || booking.status === 'confirmed') && (
                                                <>
                                                    <button
                                                        onClick={()=>handleStatusChange(booking._id, 'completed')}
                                                        className="complete-button">
                                                        <CheckIcon className="h-4 w-4"/>
                                                        Mark Completed
                                                    </button>
                                                    <button
                                                        onClick={()=>handleStatusChange(booking._id, 'cancelled')}
                                                        className="cancel-button">
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {/* Show negotiation button if there is an active negotiaiton for beautician to counter-propose */}
                                            {(booking.negotiationStatus === "pending-customer-response" ||
                                                booking.negotiationStatus === "pending-beautician-response"
                                            ) && (
                                                <button
                                                    onClick={()=>handleNegotiateClick(booking._id)}
                                                    className="negotiate-button animate-pulse" // Add pulse for active negotiation
                                                    title="continue-negotiation"
                                                >
                                                    <ChatBubbleLeftRightIcon className="h-4 w-4"/>
                                                    Negotiate
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        // Customer's view of negotiation
                                        <>
                                            {/* Show negotiate button for customer t respond or counter-propose */}
                                            {(booking.negotiationStatus === "pending-customer-response" ||
                                                booking.negotiationStatus === "pending-beautician-response"
                                            ) && (
                                                <div className="booking-actions">
                                                    <button
                                                        onClick={()=> handleNegotiateClick(booking._id)}
                                                        className="negotiate-button animate-pulse"
                                                        title="Respond to negotiate"
                                                    >
                                                        <ChatBubbleLeftRightIcon className="h-4 w-4"/>
                                                        Respond
                                                    </button>
                                                </div>
                                            )}
                                            {booking.status === 'pending' && (
                                                <div className="booking-actions">
                                                    <button
                                                        onClick={()=> handleStatusChange(booking._id, 'cancelled')}
                                                        className="cancel-button"
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                    </>
                                    )}
                                </div>

                                <div className="booking-details">
                                    <div className="booking-meta">
                                        {user?.role === 'customer' && booking.beauticianId && (
                                            <div className="booking-beautician">
                                                <img
                                                    src={booking.beauticianId?.userId?.profilePhoto || '/default-profile.jpg'}
                                                    alt={booking.beauticianId?.userId?.name}
                                                    className="beautician-photo"
                                                />
                                                <span>{booking.beauticianId?.userId?.name || 'Unknown Beautician'}</span>
                                            </div>
                                        )}
                                        <span className={`booking-type ${booking.type==='in-home'?'in-home':'salon'}`}>
                                            {booking.serviceType==='in-home'?'At Your Location':'At Salon'}
                                        </span>
                                        <span className="booking-date">
                                            <CalendarIcon className="booking-meta-icon" />
                                            {formatDate(booking.date)}
                                            {/* Display negotiated date if available and negotiation is active */}
                                            {(booking.proposedChanges?.date || booking.negotiatedDate) &&
                                                (booking.negotiationStatus === "pending-customer-response" ||
                                                    booking.negotiationStatus === "pending-beautician-response"
                                                ) && (
                                                    <span className="negotiated-date ml-2 text-blue-600 font-medium">
                                                        (Proposed: {formatDate(booking.proposedChanges?.date || booking.negotiatedDate)})
                                                    </span>
                                                )
                                            }
                                        </span>
                                    </div>
                                    <div className="booking-price">
                                        Ksh {booking.amount}
                                    </div>
                                </div>
                                {user?.role === 'beautician' && booking.customerId && (
                                    <div className="booking-customer">
                                        <span>Customer: {booking.customerId.name}</span>
                                        <span>Phone: {booking.customerId.phone}</span>
                                    </div>
                                )}

                                {/* Conditional rendering for bookingnegotiation */}
                                {showNegotiationForBookingId === booking._id && (
                                    <BookingNegotiation 
                                        booking={booking}
                                        onNegotiationComplete={handleNegotiationComplete}
                                        onCancelNegotiation={handleCancelNegotiation}
                                        onProposedChangesUpdate={handleProposedChangesUpdate}
                                    />
                                )}

                                {showReviewForBookingId === booking._id && (
                                    <div className="review-modal">
                                        <ReviewCard
                                            booking={booking}
                                            onSubmitReview={handleCreateReview}
                                            OnCancel={()=>setShowReviewForBookingId(null)}
                                        />
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}