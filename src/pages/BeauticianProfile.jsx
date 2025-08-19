// src/pages/BeauticianProfile.jsx
import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react"; 
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import BookingModal from "../components/BookingModal";
import { StarIcon } from "@heroicons/react/24/solid";
import "../styles/beauticianprofile.css";
import EditProfileModal from "../components/EditProfileModal";

export default function BeauticianProfile() {
    const { user } = useAuth();
    const { id } = useParams();
    const [beautician, setBeautician] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState({
        profile: false,
        salon: false
    });

    //  Wrapped the data fetching logic in useCallback.
    // This prevents the function from being recreated on every render, which is a performance best practice.
    // It also combines my initial fetch logic and the separate function into one.
    const fetchBeauticianData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch Beautician Profile
            const beauticianRes = await axios.get(
                `https://glam-express-backend.onrender.com/api/beauticians/${id}`
             );
            if (!beauticianRes.data.success) {
                throw new Error(beauticianRes.data.message || 'Failed To Fetch Beautician');
            }
            setBeautician(beauticianRes.data.data);

            // Fetch Reviews
            try {
                const reviewRes = await axios.get(
                    `https://glam-express-backend.onrender.com/api/reviews/beautician-reviews`,
                    { params: { beauticianId: id } }
                 );
                setReviews(reviewRes.data.data || []);
            } catch (reviewError) {
                console.error("Reviews not fetched:", reviewError.response?.data || reviewError.message);
                setReviews([]); // Set to empty array on error
            }
        } catch (err) {
            console.error("Error Fetching Data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]); // The function will only be recreated if the `id` parameter changes.

    // The useEffect hook now calls the fetchBeauticianData function.
    // This is cleaner and solves the "unused variable" warning.
    useEffect(() => {
        fetchBeauticianData();
    }, [fetchBeauticianData]); // The effect will run whenever fetchBeauticianData is (re)created.

    // Handle image errors
    const handleImageError = (imageType) => {
        setImageErrors(prev => ({ ...prev, [imageType]: true }));
    };

    // This function is called by the EditProfileModal after a successful update.
    const handleProfileUpdate = (updatedBeautician) => {
        setBeautician(updatedBeautician); // Update the state with the new data from the modal.
    };

    // Construct image URL with proper error handling
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http' )) return imagePath;
        return imagePath;
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
    );

    if (error) return (
        <div className="text-center py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        </div>
    );

    if (!beautician) return (
        <div className="text-center py-8">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                Beautician Not Found
            </div>
        </div>
    );

    const profileImageUrl = getImageUrl(beautician.profilePhoto);
    const salonImageUrl = getImageUrl(beautician.salonPhoto);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="md:w-1/3">
                    {/* Profile Photo Section */}
                    <div className="mb-4">
                        {profileImageUrl && !imageErrors.profile ? (
                            <img
                                src={profileImageUrl}
                                alt={beautician.userId?.name || 'Beautician'}
                                className="w-full h-64 object-cover rounded-lg shadow-md"
                                onError={() => handleImageError('profile')}
                            />
                        ) : (
                            <div className="w-full h-64 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg shadow-md flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-3xl font-bold text-pink-600">
                                            {beautician.userId?.name?.charAt(0) || 'B'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500">No Profile Image</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Salon Photo Display (Conditional) */}
                    {beautician.serviceType?.includes('salon') && (
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2 text-gray-800">Salon Preview</h3>
                            {salonImageUrl && !imageErrors.salon ? (
                                <img
                                    src={salonImageUrl}
                                    alt="Salon"
                                    className="w-full h-48 object-cover rounded-lg shadow-md"
                                    onError={() => handleImageError('salon')}
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-lg shadow-md flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <span className="text-2xl text-gray-400">🏪</span>
                                        </div>
                                        <p className="text-gray-500 text-sm">No Salon Image</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="md:w-2/3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-gray-900">
                                {beautician.userId?.name || 'Unknown Beautician'}
                            </h1>
                            <div className="flex items-center mb-4">
                                <span className="text-yellow-500 text-lg">★</span>
                                <span className="text-gray-700 ml-2 font-medium">
                                    {beautician.rating?.toFixed(1) || '0.0'}
                                </span>
                                <span className="text-gray-500 ml-2">
                                    ({beautician.totalReviews || 0} reviews)
                                </span>
                                {beautician.isPremium && (
                                    <span className="ml-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        ⭐ Premium
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Edit profile button */}
                        {user && user.role === 'beautician' && user.id === beautician.userId._id && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors duration-200 font-medium whitespace-nowrap"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>


                    <p className="text-gray-700 mb-6 leading-relaxed">
                        {beautician.bio || 'Professional beautician offering quality services.'}
                    </p>

                    {/* Location */}
                    {beautician.salonAddress && (
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2 text-gray-800">Location</h3>
                            <p className="text-gray-600 flex items-center">
                                <span className="mr-2">📍</span>
                                {beautician.salonAddress}
                            </p>
                        </div>
                    )}

                    {/* Service Types */}
                    {beautician.serviceType && beautician.serviceType.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2 text-gray-800">Service Types</h3>
                            <div className="flex flex-wrap gap-2">
                                {beautician.serviceType.map((type, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm capitalize"
                                    >
                                        {type.replace('-', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services Offered */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2 text-gray-800">Services Offered</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {beautician.services?.length > 0 ? (
                                beautician.services.map((service, index) => 
                                    service && (
                                    <div key={index} className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-pink-800">
                                                {service.name}
                                            </span>
                                            <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                                                KES {service.price ? service.price.toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 col-span-full">No services listed</p>
                            )}
                        </div>
                    </div>

                    {user && user.role === 'customer' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition-colors duration-200 font-medium text-lg"
                        >
                            Book Now
                        </button>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <section className="mt-12">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Customer Reviews ({reviews.length})</h2>
                {reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                                <div className="flex items-center mb-4">
                                    {review.customerId?.profilePhoto ? (
                                        <img
                                            src={getImageUrl(review.customerId.profilePhoto)}
                                            alt={review.customerId?.name}
                                            className="w-10 h-10 rounded-full mr-3 object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                                            <span className="text-gray-500 text-lg">
                                                {review.customerId?.name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-medium">{review.customerId?.name || 'Anonymous'}</h3>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon
                                                    key={i}
                                                    className={`h-5 w-5 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-2">{review.comment}</p>
                                <p className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-500">This beautician has not been reviewed yet.</p>
                    </div>
                )}
            </section>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                beautician={beautician}
            />

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                beautician={beautician}
                onProfileUpdate={handleProfileUpdate}
            />
        </div>
    );
}
