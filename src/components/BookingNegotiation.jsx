import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { XMarkIcon, CheckIcon, ArrowPathIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import "../styles/bNegotiation.css"

export default function BookingNegotiation({
    booking,
    onNegotiationComplete,
    onCancelNegotiation,
    onProposedChangesUpdate
}) {
    const { user } = useAuth();
    const [proposedChanges, setProposedChanges] = useState({
        date: booking.proposedChanges?.date || booking.negotiatedDate || booking.date,
        serviceType: booking.proposedChanges?.serviceType || booking.negotiatedServiceType || booking.serviceType,
        services: booking.proposedChanges?.services || booking.negotiatedServices || booking.services,
    });
    const [isProposing, setIsProposing] = useState(false);
    const [negotiationStatus, setNegotiationStatus] = useState(booking.negotiationStatus || 'initial');
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onCancelNegotiation(booking._id);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [booking._id, onCancelNegotiation]);

    useEffect(() => {
        setProposedChanges({
            date: booking.proposedChanges?.date || booking.negotiatedDate || booking.date,
            serviceType: booking.proposedChanges?.serviceType || booking.negotiatedServiceType || booking.serviceType,
            services: booking.proposedChanges?.services || booking.negotiatedServices || booking.services,
        });
        setNegotiationStatus(booking.negotiationStatus || "initial");
        setMessage("");
        setError("");
    }, [booking]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProposedChanges(prev => ({ ...prev, [name]: value }));
    };

    // Function to format services array for display
    const formatServices = (services) => {
        if (!services || !Array.isArray(services)) return "No services selected";
        
        // Handle both string and object service formats
        return services.map(service => 
            typeof service === 'string' ? service : service.name
        ).join(", ");
    };


    const handleProposeChanges = async () => {
        setIsLoading(true);
        setMessage("");
        setError("");
        try {
            const res = await axios.put(
                `https://glam-express-backend.onrender.com/api/bookings/${booking._id}/propose-changes`,
                proposedChanges,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (res.data.success) {
                setNegotiationStatus('changes-proposed');
                onProposedChangesUpdate(booking._id, res.data.data);
                setIsProposing(false);
                setMessage("Changes proposed successfully! Waiting for response.");
            } else {
                setError(res.data.message || "Failed to propose changes");
            }
        } catch (error) {
            console.error('Error Proposing Changes:', error);
            setError(error.response?.data?.message || "Failed to propose changes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptChanges = async () => {
        setIsLoading(true);
        setMessage("");
        setError("");
        try {
            const res = await axios.patch(
                `https://glam-express-backend.onrender.com/api/bookings/${booking._id}/accept-negotiation`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (res.data?.success) {
                setMessage("Negotiation accepted! Booking confirmed with new details.");
                onNegotiationComplete(booking._id, res.data.data);
            } else {
                setError(res.data?.message || "Failed to accept changes.");
            }
        } catch (error) {
            console.error("Error Accepting Changes:", error);
            setError(error.response?.data?.message || "Accepting changes failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectChanges = async () => {
        setIsLoading(true);
        setMessage("");
        setError("");
        try {
            const res = await axios.patch(
                `https://glam-express-backend.onrender.com/api/bookings/${booking._id}/reject-negotiation`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (res.data.success) {
                setMessage("Negotiation rejected. Booking reverted to previous state.");
                onNegotiationComplete(booking._id, res.data.data);
            } else {
                setError(res.data.message || "Failed to reject changes");
            }
        } catch (error) {
            console.error("Error rejecting changes:", error);
            setError(error.response?.data?.message || "Rejecting Changes Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div 
                ref={modalRef} 
                className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in"
            >
                <div className="flex justify-between items-center border-b p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
                        Booking Negotiation
                    </h3>
                    <p className="text-sm mt-1 ml-1 text-white/80 italic">
                    Status: <span className="font-semibold capitalize">{negotiationStatus}</span>
                    </p>
                    <button 
                        onClick={() => onCancelNegotiation(booking._id)}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <div className="flex items-center text-red-700">
                                <XMarkIcon className="h-5 w-5 mr-2" />
                                <span>{error}</span>
                            </div>
                        </div>
                    )}
                    {message && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                            <div className="flex items-center text-green-700">
                                <CheckIcon className="h-5 w-5 mr-2" />
                                <span>{message}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-700 mb-3">Original Booking</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date:</span>
                                    <span className="font-medium">{new Date(booking.date).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Service Type:</span>
                                    <span className="font-medium capitalize">{booking.serviceType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Service:</span>
                                    <span className="font-medium">{formatServices(booking.services)}</span>
                                </div>
                            </div>
                        </div>

                        {(booking.proposedChanges?.date || booking.negotiatedDate) && !isProposing && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-blue-700 mb-3">
                                  {booking.negotiationStatus === 'pending-customer-response'
                                    ? "Beautician's Proposed Changes" 
                                    : "Your Proposed Changes"}
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">New Date:</span>
                                        <span className="font-medium text-blue-800">
                                            {new Date(booking.proposedChanges?.date || booking.negotiatedDate).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">New Service Type:</span>
                                        <span className="font-medium text-blue-800 capitalize">
                                            {booking.proposedChanges?.serviceType || booking.negotiatedServiceType}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">New Service:</span>
                                        <span className="font-medium text-blue-800">
                                            {formatServices(booking.proposedChanges?.services || booking.negotiatedServices)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isProposing ? (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleAcceptChanges}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckIcon className="h-4 w-4" />
                                )}
                                Accept Changes
                            </button>
                            <button
                                onClick={handleRejectChanges}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                    <XMarkIcon className="h-4 w-4" />
                                )}
                                Reject Changes
                            </button>
                            <button
                                onClick={() => setIsProposing(true)}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors"
                            >
                                <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                                Propose New Changes
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                                    <input
                                        type="datetime-local"
                                        name="date"
                                        value={proposedChanges.date}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Service Type</label>
                                    <select
                                        name="serviceType"
                                        value={proposedChanges.serviceType}
                                        onChange={handleInputChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                    >
                                        <option value="salon">At Salon</option>
                                        <option value="in-home">In Home</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Service</label>
                                    <input
                                        type="text"
                                        name="service"
                                        value={proposedChanges.service}
                                        onChange={handleInputChange}
                                        placeholder="Enter Service Name"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleProposeChanges}
                                    disabled={isLoading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckIcon className="h-4 w-4" />
                                    )}
                                    Confirm Proposal
                                </button>
                                <button
                                    onClick={() => setIsProposing(false)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition-colors"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}