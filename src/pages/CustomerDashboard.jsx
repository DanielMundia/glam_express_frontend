import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import "../styles/customer-dashboard.css"; // Import the CSS file

export default function CustomerDashboard() {
    const {user, logout}=useAuth();
    const [pastBookings, setPastBookings]=useState([]);
    const [showSettings, setShowSettings]=useState(false);
    const [showAllBookings, setShowAllBookings] = useState(false);
    const [showAllReviews, setShowAllReviews]=useState(false);
    const [customerReviews, setCustomerReviews]=useState([]);
    const [loading, setLoading]=useState(true);
    const [error, setError]=useState('');

    useEffect(()=>{
        // Only fetch if user exists
        if (!user) return;

        const fetchPastBookings=async()=>{
            try {
                const response=await axios.get('https://glam-express-backend.onrender.com/api/bookings/customer/history',
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        },
                        timeout: 15000
                    }
                );
                if (response.data.success) {
                    setPastBookings(response.data.data || []);
                } else {
                    setError(response.data.message || 'Failed To Load Bookings');
                }
            } catch (error) {
                console.error('Failed To Fetch Booking History:', error);
                setError(error.response?.data?.message || error.message || "Failed To load dashboard data");
            } finally {
                setLoading(false)
            }
        };
        fetchPastBookings();
    }, [user]);

    useEffect(()=> {
        const fetchCustomerReviews=async()=>{
            try {
                const response=await axios.get(
                    'https://glam-express-backend.onrender.com/api/reviews/customer',
                    {headers: {
                        Authorization: `Bearer ${user.token}`
                    }}
                );
                setCustomerReviews(response.data.data || []);
                console.log("Reviews Fetched Successfully!")
            } catch (error) {
                console.error('Failed To Fetch Reviews:', error);
                console.log("Reviews Fetching Failed", error);
            }
        };
        if (user) {
            fetchCustomerReviews();
        }
    }, [user]);
    

    const handleDeleteAccount=async()=>{
        if (window.confirm ('Are you sure You want to delete your account? This Action cannot be undone.')) {
            try {
                await axios.delete('https://glam-express-backend.onrender.com/api/beauticians/account', {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                logout();
                alert('Your Account has been deleted successfully');
            } catch (error) {
                console.error('Account Deletion Failed:', error);
                alert('Failed To Delete Your Account, Please try again.');
            }
        }
    };
    
    const formatServices = (services) => {
        if (!services) return 'No services';
        // Handle case where services is an array of strings
        if (Array.isArray(services) && services.every(item => typeof item === 'string')) {
            return services.join(', ');
        }
        // Handle case where services is an array of objects with name property
        if (Array.isArray(services) && services.every(item => item?.name)) {
            return services.map(service => service.name).join(', ');
        }
        // handle case where services is a single string (legacy format)
        if (typeof services === 'string') {
            return services;
        }
        return 'No Services specified';
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                Failed to load dashboard data. Please try again later
            </div>
        )
    }

    console.log('Past bookings with services:', pastBookings.map(b => ({
        id: b._id,
        services: b.services,
        hasReview: !!b.review,
        rating: b.review?.rating,
        reviewId: b.review?._id
    })));

    if (!user) {
        return (
            <div className="auth-prompt-container">
                <div className="auth-prompt-card">
                    <div className="auth-icon">
                        <i className="fas fa-user-circle"></i>
                    </div>
                    <h2 className="auth-title">Welocome To GlamExpress</h2>
                    <p className="auth-message">Please Sign In To Access Your Dashboard</p>
                    <div className="auth-actions">
                        <Link to="/login" className="auth-button primary">
                            <i className="fas fa-sign-in-alt"></i> Login
                        </Link>
                        <Link to="/register" className="auth-button secondary">
                            <i className="fas fa-user-plus"></i> Register
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        
        <div className="customer-dashboard">
            <div className="dashboard-container">
                {/* Dashboard Header */}
                <div className="dashboard-header">
                    <h1 className="dashboard-title">My Dashboard</h1>
                    <div className="relative">
                        <button
                            onClick={()=>setShowSettings(!showSettings)}
                            className="settings-button"
                        >
                            <i className="fas fa-cog"></i> Settings
                        </button>

                        <div className={`settings-dropdown ${showSettings ? 'active' : ''}`}>
                            <button
                                onClick={logout}
                                className="settings-item"
                            >
                                <i className="fas fa-sign-out-alt"></i> Log Out
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="settings-item danger"
                            >
                                <i className="fas fa-trash-alt"></i> Delete Account
                            </button>
                        </div>
                    </div>
                </div>

                {/* Past Bookings Section */}
                <section className="bookings-section">
                    <div className="section-header">
                        <h2 className="section-title">My Past Bookings</h2>
                        {pastBookings.length > 0 && (
                            <button
                                onClick={()=>setShowAllBookings(!showAllBookings)}
                                className="view-all-button"
                            >
                                {showAllBookings ? 'Show Less' : 'View All'}
                                <i className={`fas fa-chevron-${showAllBookings ? 'up' : 'down'}`}></i>
                            </button>
                        )}
                    </div>

                    {pastBookings.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <i className="far fa-calendar-check"></i>
                            </div>
                            <h3 className="empty-state-title">No Bookings Yet</h3>
                            <p className="empty-state-description">You haven't booked any services yet. Find a beautician and book your first appointment!</p>
                            <Link
                                to="/beauticians"
                                className="cta-button"
                            >
                                Find a Beautician
                            </Link>
                        </div>
                    ) : (
                        <div className="bookings-table-container">
                            <table className="bookings-table">
                                <thead>
                                    <tr>
                                        <th>Beautician</th>
                                        <th>Service/Services</th>
                                        <th>Type</th>
                                        <th>Date</th>
                                        <th>Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showAllBookings ? pastBookings : pastBookings.slice(0, 5)).map(booking=>(
                                        <tr key={booking._id}>
                                            <td>
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {booking.beauticianId.userId.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {booking.services}
                                            </td>
                                            <td>
                                                <span className={`service-type ${
                                                    booking.serviceType === 'salon' ? 'salon' : 'home'
                                                }`}>
                                                    {booking.serviceType}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(booking.actualServiceDate || booking.date).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {booking.review ? (
                                                    <div className="flex items-center">
                                                        <div className="flex mr-1">
                                                            {[1,2,3,4,5].map((star)=>(
                                                                <StarIcon
                                                                    key={star}
                                                                    className={`h-4 w-4 ${star <=booking.review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            {booking.review.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Not Rated</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Recent Reviews Section */}
                <section className="reviews-section">
                    <div className="section-header">
                        <h2 className="section-title">My Reviews</h2>
                        {customerReviews.length > 0 && (
                            <button
                                onClick={()=>setShowAllReviews(!showAllReviews)}
                                className="view-all-button"
                            >
                                {showAllReviews ? 'Show Less' : 'View All'}
                                <i className={`fas fa-chevron-${showAllReviews ? 'up' : 'down'}`}></i>
                            </button>
                        )}
                    </div>

                    {customerReviews.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <i className="far fa-comment-dots"></i>
                            </div>
                            <h3 className="empty-state-title">No Reviews Yet</h3>
                            <p className="empty-state-description">You haven't reviewed any services yet. After your next appointment, come back to share your experience!</p>
                        </div>
                    ) : (
                        <div className="reviews-grid">
                            {(showAllReviews ? customerReviews :
                                customerReviews.slice(0,4)
                            ).map(review=>(
                                    <div key={review._id} className="review-card">
                                        <div className="review-header">
                                            <div>
                                                <h3 className="review-beautician">{review.beauticianId?.userId?.name || 'Unknown Beautician'}</h3>
                                                <p className="review-service">{review.bookingId?.services ? formatServices(review.bookingId?.services) : 'Service not specified'}</p>
                                            </div>
                                            <div className="review-rating">
                                                {'★'.repeat(review.rating)}
                                                {'☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                        <p className="review-content">{review.comment}</p>
                                        <p className="review-date">
                                            Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}