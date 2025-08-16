// BeauticianCompleteProfile.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function BeauticianCompleteProfile() {
    const {user} = useAuth()
    const navigate=useNavigate()
    const [formData, setFormData]=useState({
        bio: '',
        services: [{name: '', price:''}],
        location: {
            type: 'Point',
            coordinates: [0,0],
            address: ''
        },
        serviceType: ['salon', 'in-home'], // Default Options
        salonAddress: '',
        profilePhoto: null,
        salonPhoto: null,
    });
    const [loading, setLoading]=useState(false);
    const [error, setError]=useState('');

    // Handle Profile Photo Upload
    const handleProfilePhotoChange=(e)=>{
        setFormData(prev=>({
            ...prev,
            profilePhoto: e.target.files[0], // Store The Selected File
        }));
    };

    // Handle salon Photo upload
    const handleSalonPhotoChange=(e)=>{
        setFormData(prev=>({
            ...prev,
            salonPhoto: e.target.files[0],
        }));
    };

    const renderImagePreview = (file) => {
        if (!file) return null;
        try {
            const url = URL.createObjectURL(file);
            return (
                <div className="mt-2">
                    <img
                        src={url}
                        alt="Preview"
                        className="h-20 w-20 rounded-md object-cover"
                        onLoad={() => URL.revokeObjectURL(url)} // Clean up memory
                    />
                </div>
            );
        } catch (error) {
            console.error("Error creating object URL:", error);
            return null;
        }
    };

    // Handle form input changes
    const handleChange=(e)=>{
        const {name, value}=e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }


    // Handle Services Input (comma separated)
    const handleServiceChange=(index, field, value)=>{
        setFormData(prev=>{
            const updatedServices=[...prev.services];
            updatedServices[index]={
                ...updatedServices[index],
                [field]:field==='price' ? (value === '' ? '' :Number(value)) : value
            };
            return { ...prev, services: updatedServices}
        })
    };

    const addServiceField=()=>{
        setFormData(prev => ({
            ...prev,
            services: [...prev.services, {name: '', price:'' }]
        }));
    };

    const removeServiceField=(index)=>{
        if (formData.services.length>1) {
            setFormData(prev => {
                const updatedServices=[...prev.services];
                updatedServices.splice(index, 1);
                return {...prev, services:updatedServices};
            })
        }
    }

    // Handle Service Type toggle
    const toggleServiceType=(type)=>{
        setFormData(prev =>{
            const currentTypes=[...prev.serviceType];
            const typeIndex = currentTypes.indexOf(type);
            if (typeIndex === -1) {
                currentTypes.push(type);
            } else {
                currentTypes.splice(typeIndex, 1);
            }
            return { ...prev, serviceType: currentTypes};
        });
    }

    // Handle Form Sbmission
    const handleSubmit=async(e)=>{
        e.preventDefault();
        const validatedServices=formData.services.map(service=>({
            name: service.name.trim(),
            price: Number(service.price)
        })).filter(service=>(
            service.name &&
            !isNaN(service.price) &&
            service.price >=0
        ));
        if (validatedServices.length===0) {
            setError('Please Add at least one valid service with price');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // First Convert Address to coordinates (you'll need a geocoding service)
            // This ia a mock implementation-replace with actual geocoding
            const mockCoordinates=[
                -1.2921 + (Math.random() * 0.01-0.005), // Small random Variation
                36.8219 + (Math.random() * 0.01-0.005)
            ];
            const formDataToSend=new FormData();
            formDataToSend.append('bio', formData.bio);
            formDataToSend.append('services', JSON.stringify(validatedServices));
            formDataToSend.append('location', JSON.stringify({...formData.location,coordinates: mockCoordinates}));
            formDataToSend.append('serviceType', JSON.stringify(formData.serviceType));
            formDataToSend.append('salonAddress', formData.salonAddress);
            formDataToSend.append('userId', user.id);

            if (formData.profilePhoto) {
                formDataToSend.append('profilePhoto', formData.profilePhoto);
            }
            if (formData.salonPhoto) {
                formDataToSend.append('salonPhoto', formData.salonPhoto);
            }
            await axios.post('https://glam-express-backend.onrender.com/api/beauticians', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Required for Field Uploads
                },
            });
            console.log("Profile Completed");
            navigate ('/beauticiandashboard');
        } catch (error) {
            setError(error.response?.data?.message || "Profile Completion Failed. Please Try Again");
            console.log("Could not complete profile...");
            console.error('Profile Completion error:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Complete Your Beautician Profile</h1>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bio Section */}
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Bio
                    </label>
                    <textarea 
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Tell Clients about your skills, experience, and specialties..."
                        required
                    />
                </div>

                {/* Services Offered */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Services & Pricing
                    </label>
                    {formData.services.map((service, index)=>(
                        <div key={index} className="flex gap-4 mb-3 items-end">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                    Service {index + 1}
                                </label>
                                <input
                                    type="text"
                                    value={service.name}
                                    onChange={(e)=>handleServiceChange(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                    placeholder="e.g., Braiding, Makeup"
                                    required
                                />
                            </div>
                            <div className="w-1/3">
                                <label className="block text-xs text-gray-500 mb-1">
                                    Price (KES)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={service.price}
                                    onChange={(e)=>handleServiceChange(index, 'price', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                    placeholder="1000"
                                    required
                                />
                            </div>
                            {formData.services.length>1 &&(
                                <button
                                    type="button"
                                    onClick={()=>removeServiceField(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addServiceField}
                        className="mt-2 text-sm text-pink-600 hover:text-pink-800 flex items-center"
                    >
                        <>
                            <i className="fas fa-plus mr-1"></i>Add Another Service
                        </>
                    </button>
                </div>

                {/* Service Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Type
                    </label>
                    <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                            <input 
                                type="checkbox"
                                checked={formData.serviceType.includes('salon')}
                                onChange={()=> toggleServiceType('salon')}
                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-700">Salon Services</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.serviceType.includes('in-home')}
                                onChange={()=>toggleServiceType('in-home')}
                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-700">In-Home Services</span>
                        </label>
                    </div>
                </div>

                {/* Location */}
                {formData.serviceType.includes('salon') && (
                    <div>
                        <label htmlFor="salonAddress" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Salon's Location
                        </label>
                        <input 
                            type="text"
                            id="salonAddress"
                            name="salonAddress"
                            value={formData.salonAddress}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                            placeholder="Where is your salon located"
                            />
                    </div>
                )}

                {/* Beautician Profile Photo upload */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Profile Photo
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                        required
                    />
                    {renderImagePreview(formData.profilePhoto)}
                </div>

                {/* Salon Photo Upload (conditional) */}
                {formData.serviceType.includes('salon') && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Salon/Workspace Photo
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleSalonPhotoChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                        />
                        {renderImagePreview(formData.salonPhoto)}
                    </div>
                )}

                {/* Submit Button */}
                <div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 
                            ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing ...
                            </>
                        ) : 'Complete Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}