import { useEffect, useRef, useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/bookingmodal.css";
import {StandaloneSearchBox } from "@react-google-maps/api";

export default function BookingModal({ isOpen, onClose, beautician }) {
    const { user, loading } = useAuth();
    const [date, setDate] = useState(new Date());
    const [serviceType, setServiceType] = useState("in-home");
    const [address, setAddress] = useState("");
    const [locationSource, setLocationSource] = useState("current"); // "current" or "manual"
    const [currentCoords, setCurrentCoords] = useState(null); // Current geo coords
    const [manualAddress, setManualAddress] = useState(""); // Manual typed address
    const [searchBox, setSearchBox] = useState(null); // reference to Google Autocomplete
    const [selectedServices, setSelectedServices] = useState([
        {
            id: 1,
            service: beautician.services[0]
                ? (typeof beautician.services[0] === "string"
                    ? beautician.services[0]
                    : beautician.services[0].name)
                : "",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(
        beautician?.services?.[0]?.price || 0
    );
    const [error, setError] = useState();
    const [success, setSuccess] = useState();
    const modalRef = useRef(null);
    const [nextId, setNextId] = useState(2);

    // Set Initial selected services if beautician services are available
    useEffect(() => {
        if (beautician?.services?.length > 0) {
            const firstService = beautician.services[0];
            setSelectedServices([{
                id: 1,
                service: typeof firstService === 'string' ? firstService : firstService.name
            }]);
            if (typeof firstService === 'object') {
                setTotalAmount(firstService.price);
            }
        }
    }, [beautician]);

    // Calculate total amount whenever selected services changes
    useEffect(() => {
        if (!beautician?.services) return;
            
        let total = 0;
        selectedServices.forEach(serviceObj => {
            const serviceName = serviceObj.service;
            const service = beautician.services.find(s =>
                typeof s === 'string' ? s === serviceName : s.name === serviceName
            );
            if (service && typeof service === 'object') {
                total += service.price;
            }            
        });
        setTotalAmount(total);
    }, [selectedServices, beautician?.services]);

    // Fetch current user location and reverse geocode to address
    const fetchCurrentLocationAndAddress = () => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCurrentCoords({ lat, lng });
                setAddress("Fetching your current address..."); // Show loading msg

                try {
                    const res = await axios.get(
                        'https://glam-express-backend.onrender.com/api/location/reverse-geocode',
                        { params: { lat, lng } }
                    );

                    // Use address from backend if available, otherwise check Google API data
                    if (res.data.address) {
                        setAddress(res.data.address);
                    } else if (res.data.status === "OK" && res.data.results?.length) {
                        setAddress(res.data.results[0].formatted_address);
                    } else {
                        setAddress("");
                        alert("Unable to determine your address from location.");
                    }
                } catch (error) {
                    console.error("Reverse geocoding failed:", error);
                    setAddress("");
                    alert("Failed to fetch your address from server.");
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                alert("Failed to get your location.");
            }
        );
    };

    // Load current location once when user picks "current"
    useEffect(() => {
        if (serviceType === "in-home" && locationSource === "current") {
            fetchCurrentLocationAndAddress();
        }
    }, [serviceType, locationSource]);

    // Google Places Autocomplete input handlers
    const onLoadSearchBox = (ref) => {
        setSearchBox(ref);
    };

    const onPlacesChanged = () => {
        if (searchBox !== null) {
            const places = searchBox.getPlaces();
            if (places && places.length > 0) {
                const place = places[0];
                setManualAddress(place.formatted_address || place.name);
                if (place.geometry && place.geometry.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    setCurrentCoords({ lat, lng });
                }
            }
        }
    };

    // Ensure coordinates are set if user manually types an address (no selection from autocomplete)
    useEffect(() => {
        let timeoutId;
        if (locationSource === "manual" && manualAddress.trim()) {
            timeoutId = setTimeout(async () => {
                try {
                    const res = await axios.get(
                        "https://glam-express-backend.onrender.com/api/location/geocode",
                        { params: { address: manualAddress } }
                    );
                    if (res.data?.coordinates) {
                        setCurrentCoords({
                            lat: res.data.coordinates.lat,
                            lng: res.data.coordinates.lng
                        });
                    }
                } catch (err) {
                    console.error("Manual geocoding failed:", err);
                }
            }, 800); // debounce by 800ms to avoid too many requests
        }
        return () => clearTimeout(timeoutId);
    }, [manualAddress, locationSource]);

    const handleClose = useCallback(() => {
        setSuccess(null);
        if (onClose) onClose();
    }, [onClose]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleClose();
            }
        };
        if (isOpen || success) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, success, handleClose]);
    
    // Handle service selection changes
    const handleServiceChange = (id, e) => {
        const serviceValue = e.target.value;
        setSelectedServices(prevServices => 
            prevServices.map(serviceObj => 
                serviceObj.id === id 
                    ? {...serviceObj, service: serviceValue} 
                    : serviceObj
            )
        );
    };

    const addAnotherService = () => {
        setSelectedServices(prevServices => [
            ...prevServices,
            {
                id: nextId,
                service: beautician?.services?.[0] 
                    ? (typeof beautician.services[0] === 'string' 
                        ? beautician.services[0] 
                        : beautician.services[0].name)
                    : ""
            }
        ]);
        setNextId(nextId + 1);
    };

    const removeService = (id) => {
        if (selectedServices.length <= 1) return;
        setSelectedServices(prevServices => 
            prevServices.filter(serviceObj => serviceObj.id !== id)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Please Login to book");
        if (selectedServices.length === 0)
            return alert("Please select at least one service");
        setIsLoading(true);

        try {
            const servicesArray = selectedServices.map((serviceObj) => {
                const service = beautician?.services?.find((s) =>
                    typeof s === "string"
                        ? s === serviceObj.service
                        : s?.name === serviceObj.service
                );
                if (!service) {
                    throw new Error(
                        `Service "${serviceObj.service}" not found in beautician's services`
                    );
                }
                return {
                    name: typeof service === "string" ? service : service.name,
                    price: typeof service === "object" ? service.price : 0,
                };
            });

            // Determine final booking address & coordinates
            let bookingCoords = [0, 0];
            let bookingAddress = "";
            if (serviceType === "in-home") {
                if (locationSource === "current" && currentCoords) {
                    bookingCoords = [currentCoords.lng, currentCoords.lat];
                    bookingAddress = address;
                } else if (locationSource === "manual" && manualAddress) {
                    bookingAddress = manualAddress;
                } else {
                    throw new Error("Please provide a valid location for in-home service.");
                }
            } else {
                bookingAddress = beautician.salonAddress;
            }

            const payload = {
                beauticianId: beautician._id,
                services: servicesArray,
                serviceType,
                date,
                location: {
                    coordinates: bookingCoords,
                    address: bookingAddress,
                },
                amount: totalAmount,
                customerId: user.id,
            };

            const response = await axios.post(
                "https://glam-express-backend.onrender.com/api/bookings",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data?._id) {
                setSuccess("Booking Made Successfully");
                setTimeout(onClose, 2000);
            } else {
                throw new Error("Invalid Response From Server");
            }
        } catch (error) {
            setError("Failed to book.");
            console.error("Full error:", error);
            const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "Booking failed. Please Try Again.";
            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        console.log('Auth loading true...');
        // return <div>Loading authentication...</div>; // Comment this out to test!
    }

    if (error) return <div>{error}</div>;
    if (success)
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div
                    ref={modalRef}
                    className="bg-white rounded-lg p-6 max-w-md"
                >
                    <div className="flex items-center mb-4">
                        <svg
                            className="h-6 w-6 text-green-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <h2 className="text-xl font-bold mb-4">Booking Made!</h2>
                    </div>
                    <p className="mb-4">
                        Your Booking With {beautician.userId.name} has been
                        made.
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        Please wait for the beautician to confirm the Booking
                    </p>
                    <button
                        onClick={handleClose}
                        className="w-full mt-4 bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        );

    if (!isOpen) return null;

    return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div
                    ref={modalRef}
                    className="bg-white rounded-lg p-6 w-full max-w-md"
                >
                    <h2 className="text-xl font-bold mb-4">Book {beautician.userId.name}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Select Services</label>
                            
                            {selectedServices.map((serviceObj, index) => (
                                <div key={serviceObj.id} className="flex items-center mb-2">
                                    <select
                                        value={serviceObj.service}
                                        onChange={(e) => handleServiceChange(serviceObj.id, e)}
                                        className="flex-1 p-2 border rounded"
                                        required
                                    >
                                        {beautician.services.map((service, i) => (
                                            <option
                                                value={typeof service === 'string' ? service : service.name}
                                                key={i}
                                            >
                                                {typeof service === 'string' 
                                                    ? service 
                                                    : `${service.name} (KES ${service.price})`
                                                }
                                            </option>
                                        ))}
                                    </select>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeService(serviceObj.id)}
                                            className="ml-2 p-2 text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            
                            <button
                                type="button"
                                onClick={addAnotherService}
                                className="mt-2 text-sm text-pink-600 hover:text-pink-800 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                                Add another service
                            </button>
                        </div>
                
                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Service Type</label>
                            <select
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="in-home">At My Location</option>
                                <option value="salon">At Salon</option>
                            </select>
                        </div>

                        {serviceType === "in-home" && (
                            <div className="mb-4">
                                <label className="block mb-2 font-medium">
                                    Choose Your Location
                                </label>
                                <div className="mb-2">
                                    <label className="inline-flex items-center mr-4">
                                        <input
                                            type="radio"
                                            name="locationSource"
                                            value="current"
                                            checked={locationSource === "current"}
                                            onChange={() =>
                                                setLocationSource("current")
                                            }
                                        />
                                        <span className="ml-2">Use Current Location</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="locationSource"
                                            value="manual"
                                            checked={locationSource === "manual"}
                                            onChange={() =>
                                                setLocationSource("manual")
                                            }
                                        />
                                        <span className="ml-2">
                                            Choose Different Location
                                        </span>
                                    </label>
                                </div>

                                {locationSource === "manual" && (
                                    <StandaloneSearchBox
                                        onLoad={onLoadSearchBox}
                                        onPlacesChanged={onPlacesChanged}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Enter address"
                                            className="w-full p-2 border rounded"
                                            value={manualAddress}
                                            onChange={(e) =>
                                                setManualAddress(e.target.value)
                                            }
                                        />
                                    </StandaloneSearchBox>
                                )}

                                {locationSource === "current" && (
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full p-2 border rounded bg-gray-100"
                                        value={address}
                                        placeholder="Fetching your address..."
                                    />
                                )}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Date & Time</label>
                            <DatePicker
                                selected={date}
                                onChange={(date) => setDate(date)}
                                showTimeSelect
                                timeFormat="HH:MM"
                                timeIntervals={30}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div className="mb-4 p-3 bg-gray-100 rounded">
                            <p className="font-medium">Total Amount: KES {totalAmount}</p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 disabled:opacity-50">
                                {isLoading ? "Booking..." : "Confirm Booking"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
    );
}