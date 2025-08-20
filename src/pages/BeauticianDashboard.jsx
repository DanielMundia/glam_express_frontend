// BeauticianDashboard.jsx 
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/beautician-dashboard.css"; // Import the CSS file

export default function BeauticianDashboard() {
    const { user, loading, logout } = useAuth();
    const [stats, setStats] = useState({
        totalBookings: 0,
        completedBookings: 0,
        revenue: 0,
        averageRating: 0,
        beauticianId: null
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [showAllBookings, setShowAllBookings] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [error, setError]=useState('');
    const [imageErrors, setImageErrors] = useState({
        profile: false,
        salon: false
    });

    // Fetch Dashboard data on Component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || !user.token) {
                console.log('No user or token available');
                return; // Skip if user is null/undefined
            }
            try {
                console.log('Fetching Dashboard Data...');
                // Initialize with default values
                let statsData = {
                    totalBookings: 0,
                    completedBookings: 0,
                    revenue: 0,
                    averageRating: 0
                };
                let recentBookingsData = [];
                let reviewsData = [];

                try {
                    const statsRes = await axios.get('https://glam-express-backend.onrender.com/api/beauticians/stats', {
                            headers: { Authorization: `Bearer ${user.token}` }
                        });
                        statsData = statsRes.data.data || statsData;
                        console.log('Stats loaded successfully');
                } catch (statsError) {
                    console.error('Failed to load stats:', statsError);
                }
                try {
                    const bookingsRes= await axios.get('https://glam-express-backend.onrender.com/api/beauticians/recent', {
                            headers: { Authorization: `Bearer ${user.token}` }
                        });
                        recentBookingsData = bookingsRes.data.data || [];
                        console.log('Recent Bookings loaded successfully', recentBookingsData);
                } catch (bookingsError) {
                    console.error('Failed to load recent bookings:', bookingsError);
                }
                try {
                    const reviewsRes= await axios.get('https://glam-express-backend.onrender.com/api/reviews/my-reviews', {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    reviewsData=reviewsRes.data.data || [];
                    setReviews(reviewsRes.data || []);
                    console.log('Reviews loaded successfully');
                } catch (reviewsError) {
                    console.error('Failed To Load Reviews:', reviewsError);
                }
                setStats(statsData);
                setRecentBookings(recentBookingsData);
                setReviews(reviewsData);
            } catch (error) {
                console.error('Failed To Fetch Dashboard data:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    config: error.config
                });
                setError('Failed To Load Dashboard Data');
            }
        };
        fetchDashboardData();
    }, [user, user?.token]);

    useEffect(() => {
        console.log('Recent bookings data:', recentBookings.map(b=>({
            id: b._id,
            services: b.services,
            customer: b.customerId?.name,
            date: b.date
        })));
        }, [recentBookings]);

    // Handle Delete Account
    const handleDeleteAccount = async () => {
        if (window.confirm('Are You Sure You want To Delete Your Account? This cannot be undone')) {
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
                alert('Failed to delete account. Please try again.');
            }
        }
    };

    // Handle image errors
    const handleImageError = (imageType) => {
        setImageErrors(prev => ({
            ...prev,
            [imageType]: true
        }));
    };

    // Construct image URL with proper error handling
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        // If the path already includes the full URL, use it as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        const adjustedPath = imagePath.startsWith('uploads/') ? imagePath : `uploads/${imagePath}` ;
        
        // Otherwise, construct the full URL
        return `https://glam-express-backend.onrender.com/${adjustedPath}`;
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
                {error}
                <button
                    onClick={()=> window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="auth-prompt-container">
                <div className="auth-prompt-card beautician-theme">
                    <div className="auth-icon">
                        <i className="fas fa-scissors"></i>
                    </div>
                    <h2 className="auth-title">Beautician Portal</h2>
                    <p className="auth-message">Sign In to manage your appointments and services</p>
                    <div className="auth-actions">
                        <Link to="/login" className="auth-button primary">
                            <i className="fas fa-sign-in-alt"></i> Professional Login
                        </Link>
                        <Link to="/register" className="auth-button secondary">
                            <i className="fas fa-user-tie"></i> Register
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const profileImageUrl = getImageUrl(user.profilePhoto);
    const salonImageUrl = getImageUrl(user.salonPhoto);

    return (
        <div className="beautician-dashboard">
            <div className="dashboard-container">
                {/* Dashboard Header */}
                <div className="dashboard-header">
                    <div className="profile-section">
                        {profileImageUrl && !imageErrors.profile ? (
                            <img
                                src={profileImageUrl}
                                alt="Profile"
                                className="profile-photo"
                                onError={() => handleImageError('profile')}
                            />
                        ) : (
                            <div className="profile-initial">
                                {user?.name?.charAt(0) || 'U'} {/* U is a null check */}
                            </div>
                        )}
                        <h1 className="dashboard-title">Beautician Dashboard</h1>
                    </div>

                    <div className="header-actions">
                        {stats.beauticianId && (
                            <Link
                                to={`/beauticians/${stats.beauticianId}`}
                                className="profile-button"
                            >
                                <i className="fas fa-user"></i> Profile
                            </Link>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="settings-button"
                            >
                                <i className="fas fa-cog"></i> Settings
                            </button>
                            {showSettings && (
                                <div className={`settings-dropdown ${showSettings ? 'active' : ''}`}>
                                    <button className="settings-item">
                                        <i className="fas fa-crown"></i> Get Premium
                                    </button>
                                    <button className="settings-item">
                                        <i className="fas fa-search"></i> Improve Visibility
                                    </button>
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
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards Grid */}
                <div className="stats-grid">
                    {/* Total Bookings Card */}
                    <div className="stat-card">
                        <div className="stat-label">Total Bookings</div>
                        <div className="stat-value">{stats.totalBookings}</div>
                    </div>

                    {/* Completed Bookings Card */}
                    <div className="stat-card">
                        <div className="stat-label">Completed Bookings</div>
                        <div className="stat-value">{stats.completedBookings}</div>
                    </div>

                    {/* Revenue Card */}
                    <div className="stat-card">
                        <div className="stat-label">Total Revenue</div>
                        <div className="stat-value">KES {stats.revenue? stats.revenue.toLocaleString() : 0}</div>
                    </div>

                    {/* Rating Card */}
                    <div className="stat-card">
                        <div className="stat-label">Average Rating</div>
                        <div className="stat-value">{stats.averageRating.toFixed(1)}</div>
                        <div className="rating-stars">
                            <div className="filled">
                                {'★'.repeat(Math.floor(stats.averageRating))}
                            </div>
                            <div className="empty">
                                {'☆'.repeat(5 - Math.floor(stats.averageRating))}
                            </div>
                        </div>
                    </div>

                    {/* Salon Photo Card */}
                    {user.serviceType?.includes('salon') && (
                        <div className="salon-photo-card">
                            <h3 className="stat-label">Your Salon</h3>
                            {salonImageUrl && !imageErrors.salon ? (
                                <img
                                    src={salonImageUrl}
                                    alt="Salon"
                                    className="salon-photo"
                                    onError={() => handleImageError('salon')}
                                />
                            ) : (
                                <div className="salon-photo-placeholder">
                                    <div className="placeholder-content">
                                        <span className="placeholder-icon">🏪</span>
                                        <p className="placeholder-text">No Salon Image</p>
                                    </div>
                                </div>
                            )}
                            <Link
                                to="/completeprofile"
                                className="update-photo-link"
                            >
                                Update Photo
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Bookings Section */}
                <section className="mb-12">
                    <div className="section-header">
                        <h2 className="section-title">Recent Bookings (Last 7 Days)</h2>
                        <button
                            onClick={() => setShowAllBookings(!showAllBookings)}
                            className="view-all-button"
                        >
                            {showAllBookings ? 'Show Less' : 'View All'}
                            <i className={`fas fa-chevron-${showAllBookings ? 'up' : 'down'}`}></i>
                        </button>
                    </div>

                    <div className="bookings-table-container">
                        {recentBookings.length > 0 ? (
                            <table className="bookings-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Services</th>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showAllBookings ? recentBookings : recentBookings.slice(0, 5)).map(booking => (
                                        <tr key={booking._id}>
                                            <td>
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{booking.customerId && typeof booking.customerId=== 'object' ? booking.customerId.name : 'Unknown Customer'}</div>
                                                        {booking.serviceType === 'in-home' && booking.location?.address && (
                                                            <div className="text-sm text-gray-500">{booking.location.address}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{booking.services}</td>
                                            <td>{new Date(booking.date).toLocaleDateString()}</td>
                                            <td>{booking.serviceType}</td>
                                            <td>
                                                <span className={`status-badge ${booking.status}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td>
                                                {/* <button className="action-button chat">
                                                    <i className="fas fa-comment"></i> Chat
                                                </button>
                                                <button className="action-button">
                                                    <i className="fas fa-phone"></i> Call
                                                </button> */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <p>No recent bookings found.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Reviews Section */}
                <section>
                    <div className="section-header">
                        <h2 className="section-title">Customer Reviews</h2>
                        <button
                            onClick={() => setShowAllReviews(!showAllReviews)}
                            className="view-all-button"
                        >
                            {showAllReviews ? 'Show Less' : 'View All'}
                            <i className={`fas fa-chevron-${showAllReviews ? 'up' : 'down'}`}></i>
                        </button>
                    </div>

                    <div className="reviews-grid">
                        {reviews.length > 0 ? (
                            (showAllReviews ? reviews : reviews.slice(0, 4)).map(review => (
                                <div key={review._id} className="review-card">
                                    <div className="review-header">
                                        <div className="reviewer-avatar">
                                            {review.customerId?.name?.charAt(0) || 'C'} {/* C is a null Check*/}
                                        </div>
                                        <div className="reviewer-info">
                                            <div className="reviewer-name">{review.customerId?.name || 'Anonymous'}</div>
                                            <div className="review-meta">
                                                <div className="review-rating">
                                                    {'★'.repeat(review.rating || 0)}
                                                    {'☆'.repeat(5 - (review.rating || 0))}
                                                </div>
                                                <div className="review-date">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="review-content">{review.comment || 'No comment provided.'}</p>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No reviews yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

