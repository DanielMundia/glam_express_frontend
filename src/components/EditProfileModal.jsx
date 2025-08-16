// src/components/EditProfileModal.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

// This is a new component for the Edit Profile Modal.
// It includes a form to update the beautician's profile information.

export default function EditProfileModal({ isOpen, onClose, beautician, onProfileUpdate }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        bio: '',
        salonAddress: '',
        serviceType: [],
        services: [],
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [salonPhoto, setSalonPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // When the modal opens, pre-fill the form with the beautician's current data.
    useEffect(() => {
        if (beautician) {
            setFormData({
                bio: beautician.bio || '',
                salonAddress: beautician.salonAddress || '',
                serviceType: beautician.serviceType || [],
                services: beautician.services || [],
            });
        }
    }, [beautician, isOpen]);

    // Handle changes for simple text inputs like bio and salonAddress.
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle changes for checkboxes (serviceType).
    const handleServiceTypeChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prev) => {
            const newServiceType = checked
                ? [...prev.serviceType, value]
                : prev.serviceType.filter((type) => type !== value);
            return { ...prev, serviceType: newServiceType };
        });
    };

    // Handle changes within the services list (name and price).
    const handleServiceChange = (index, e) => {
        const { name, value } = e.target;
        const newServices = [...formData.services];
        newServices[index][name] = value;
        setFormData((prev) => ({ ...prev, services: newServices }));
    };

    // Add a new empty service to the list.
    const addService = () => {
        setFormData((prev) => ({
            ...prev,
            services: [...prev.services, { name: '', price: '' }],
        }));
    };

    // Remove a service from the list by its index.
    const removeService = (index) => {
        setFormData((prev) => ({
            ...prev,
            services: prev.services.filter((_, i) => i !== index),
        }));
    };

    // Handle file selection for profile and salon photos.
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'profilePhoto') {
            setProfilePhoto(files[0]);
        } else if (name === 'salonPhoto') {
            setSalonPhoto(files[0]);
        }
    };

    // Handle the form submission.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const submissionData = new FormData();
        submissionData.append('bio', formData.bio);
        submissionData.append('salonAddress', formData.salonAddress);
        submissionData.append('serviceType', JSON.stringify(formData.serviceType));
        submissionData.append('services', JSON.stringify(formData.services));

        if (profilePhoto) {
            submissionData.append('profilePhoto', profilePhoto);
        }
        if (salonPhoto) {
            submissionData.append('salonPhoto', salonPhoto);
        }

        try {
            const res = await axios.put(
                `https://glam-express-backend.onrender.com/api/beauticians/profile/${beautician._id}`,
                submissionData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${user.token}`,
                    },
                }
             );

            if (res.data.success) {
                onProfileUpdate(res.data.data); // Callback to update the parent component's state.
                onClose(); // Close the modal on success.
            } else {
                throw new Error(res.data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Edit Your Profile</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                            <XMarkIcon className="h-7 w-7" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* --- Bio Section --- */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            placeholder="Tell us about yourself and your skills..."
                        />
                    </div>

                    {/* --- Salon Address Section --- */}
                    <div>
                        <label htmlFor="salonAddress" className="block text-sm font-medium text-gray-700 mb-1">
                            Salon Address
                        </label>
                        <input
                            type="text"
                            id="salonAddress"
                            name="salonAddress"
                            value={formData.salonAddress}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            placeholder="e.g., 123 Glamour St, Nairobi"
                        />
                    </div>

                    {/* --- Service Type Section --- */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Types
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value="salon"
                                    checked={formData.serviceType.includes('salon')}
                                    onChange={handleServiceTypeChange}
                                    className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                />
                                <span className="text-gray-700">Salon</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value="in-home"
                                    checked={formData.serviceType.includes('in-home')}
                                    onChange={handleServiceTypeChange}
                                    className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                />
                                <span className="text-gray-700">In-Home</span>
                            </label>
                        </div>
                    </div>

                    {/* --- Services Section --- */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Your Services
                        </label>
                        {formData.services.map((service, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border">
                                <input
                                    type="text"
                                    name="name"
                                    value={service.name}
                                    onChange={(e) => handleServiceChange(index, e)}
                                    placeholder="Service Name (e.g., Manicure)"
                                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500"
                                />
                                <input
                                    type="number"
                                    name="price"
                                    value={service.price}
                                    onChange={(e) => handleServiceChange(index, e)}
                                    placeholder="Price (KES)"
                                    className="w-32 p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeService(index)}
                                    className="text-red-500 hover:text-red-700 font-semibold"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addService}
                            className="w-full py-2 px-4 border-2 border-dashed border-pink-300 text-pink-600 font-semibold rounded-md hover:bg-pink-50 hover:border-pink-400 transition"
                        >
                            + Add Another Service
                        </button>
                    </div>

                    {/* --- File Uploads Section --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700 mb-1">
                                Profile Photo
                            </label>
                            <input
                                type="file"
                                id="profilePhoto"
                                name="profilePhoto"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="salonPhoto" className="block text-sm font-medium text-gray-700 mb-1">
                                Salon Photo
                            </label>
                            <input
                                type="file"
                                id="salonPhoto"
                                name="salonPhoto"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                            />
                        </div>
                    </div>

                    {/* --- Error Display --- */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* --- Submission Button --- */}
                    <div className="pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:bg-pink-300 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
