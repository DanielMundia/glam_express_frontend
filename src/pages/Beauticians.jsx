import { useState, useEffect, useCallback } from "react";
import BeauticianCard from '../components/BeauticianCard';
import axios from "axios";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/beauticians.css";
import Map from '../components/Map';

console.log('Map component import:', require('../components/Map'));

// FIXED: Moved debounce function outside component to make it stable
function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

export default function Beauticians() {
    const [beauticians, setBeauticians] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        service: '',
        location: '',
        rating: 0,
        serviceType: '' // Added service type filter
    });
    const [sortBy, setSortBy] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [userCoords, setUserCoords] = useState(null); // Added for user location
    const [showMap, setShowMap] = useState(false); // Toggle map view

    // Get user's current location
    const getUserLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    setError("Could not get your location. Using default search.");
                }
            );
        }
    }, []);

    useEffect(() => {
        getUserLocation();
    }, [getUserLocation]);

    // FIXED: Create a stable debounced function using useCallback
    const debouncedFetch = useCallback(
        debounce(async (paramsString) => {
            try {
                setLoading(true);
                let url = `https://glam-express-backend.onrender.com/api/beauticians?${paramsString}`;
                
                // If user has coordinates and no specific location filter, add them to query
                if (userCoords && !filters.location) {
                    url += `&latitude=${userCoords.lat}&longitude=${userCoords.lng}`;
                }

                const res = await axios.get(url);
                const beauticiansData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                
                // Enhance beauticians data with distance if coordinates available
                if (userCoords) {
                    beauticiansData.forEach(beautician => {
                        if (beautician.location?.coordinates) {
                            beautician.distance = calculateDistance(
                                userCoords,
                                {
                                    latitude: beautician.location.coordinates[1],
                                    longitude: beautician.location.coordinates[0]
                                }
                            );
                        }
                    });
                }

                setBeauticians(beauticiansData);
                setTotalPages(res.data?.totalPages || 1);
                setSuccess("Successfully Loaded Beauticians");
                setError('');
                console.log("Beauticians have been loaded successfully");
            } catch (error) {
                setError(error.response?.data?.message || 'Failed To Load Beauticians');
                console.log("Failed to Load Beauticians");
                setBeauticians([]);
            } finally {
                setLoading(false);
            }
        }, 500),
        [userCoords, filters.location] // FIXED: Added proper dependencies
    );

    // FIXED: Simplified fetchBeauticians to just call the debounced function
    const fetchBeauticians = useCallback((paramsString) => {
        debouncedFetch(paramsString);
    }, [debouncedFetch]);

    useEffect(() => {
        const params = new URLSearchParams();
        
        const query = new URLSearchParams(location.search).get('search');
        if (query) setSearchTerm(query);

        // Apply Filters
        if (searchTerm) params.append('search', searchTerm);
        if (filters.service) params.append('service', filters.service);
        if (filters.location) params.append('location', filters.location);
        if (userCoords && !filters.location) {
            params.append('nearby', 'true');
        }
        if (filters.rating) params.append('minRating', filters.rating);
        if (filters.serviceType) params.append('serviceType', filters.serviceType);

        // Append Sorting and Pagination
        if (sortBy) params.append('sortBy', sortBy);
        params.append('page', page);

        fetchBeauticians(params.toString());
    }, [location.search, searchTerm, filters, sortBy, page, fetchBeauticians, userCoords]);

    // Distance calculation function
    function calculateDistance(coords1, coords2) {
        const R = 6371; // Earth radius in km
        const dLat = (coords2.latitude - coords1.latitude) * Math.PI / 180;
        const dLon = (coords2.longitude - coords1.longitude) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coords1.latitude * Math.PI / 180) * 
            Math.cos(coords2.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ service: '', location: '', rating: 0, serviceType: '' });
        setSortBy('');
        setPage(1);
    };

    // Prepare markers for the map
    const mapMarkers = beauticians
        .filter(b => b.location?.coordinates)
        .map(beautician => ({
            position: {
                lat: beautician.location.coordinates[1],
                lng: beautician.location.coordinates[0]
            },
            label: beautician.userId?.name || 'Beautician'
        }));

    if (userCoords) {
        mapMarkers.unshift({
            position: userCoords,
            label: 'You',
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
        });
    }

    console.log('Current showMap state:', showMap);
    console.log('MapMarkers data:', mapMarkers);
    console.log('UserCoords:', userCoords);

    return (
        <div className="beauticians-page">
            <div className="beauticians-container">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">Find Your Perfect Beautician</h1>
                    <p className="page-subtitle">Search. Filter. Book.</p>
                </div>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Search Section */}
                <section className="search-section">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search beauticians or services..."
                            className="search-input"
                        />
                        <button
                            type="submit"
                            className="search-button"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            className="map-toggle-button"
                            onClick={() => setShowMap(!showMap)}
                        >
                            {showMap ? 'Hide Map' : 'Show Map'}
                        </button>
                    </form>
                </section>

                {/* Filters Section */}
                <section className="filters-section">
                    {/* Service Filter */}
                    <div className="filter-group">
                        <label className="filter-label">Service</label>
                        <select
                            value={filters.service}
                            onChange={(e) => setFilters({...filters, service: e.target.value})}
                            className="filter-select"
                        >
                            <option value="">All Services</option>
                            <option value="makeup">Makeup</option>
                            <option value="hair">Hair</option>
                            <option value="nails">Nails</option>
                            <option value="facials">Facials</option>
                        </select>
                    </div>

                    {/* Location Filter */}
                    <div className="filter-group">
                        <label className="filter-label">Location</label>
                        <input
                            type="text"
                            value={filters.location}
                            onChange={(e) => setFilters({...filters, location: e.target.value})}
                            placeholder="Location"
                            className="filter-input"
                        />
                    </div>

                    {/* Rating Filter */}
                    <div className="filter-group">
                        <label className="filter-label">Minimum Rating</label>
                        <select
                            value={filters.rating}
                            onChange={(e) => setFilters({...filters, rating: Number(e.target.value)})}
                            className="filter-select"
                        >
                            <option value="0">Any Rating</option>
                            <option value="4">4+ Stars</option>
                            <option value="3">3+ Stars</option>
                        </select>
                    </div>

                    {/* Service Type Filter */}
                    <div className="filter-group">
                        <label className="filter-label">Service Type</label>
                        <select
                            value={filters.serviceType}
                            onChange={(e) => setFilters({...filters, serviceType: e.target.value})}
                            className="filter-select"
                        >
                            <option value="">All Types</option>
                            <option value="salon">Salon Services</option>
                            <option value="in-home">In-Home Services</option>
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div className="filter-group">
                        <label className="filter-label">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Default</option>
                            <option value="ratingHighToLow">Rating: High to Low</option>
                            <option value="PriceLowToHigh">Price: Low to High</option>
                            <option value="priceHighToLow">Price: High to Low</option>
                            {userCoords && <option value="distance">Distance: Nearest First</option>}
                        </select>
                    </div>

                    {/* Location Awareness */}
                    {userCoords && !filters.location && (
                        <div className="location-notice">
                            Showing beauticians near your current location
                        </div>
                    )}
                </section>

                {/* Map View */}
                {showMap && (
                    console.log('Attempting to render Map with:', {
                        center: userCoords || { lat: 0, lng: 0 },
                        markers: mapMarkers
                    }),
                    <div className="map-container">
                        <Map 
                            center={userCoords || { lat: 0, lng: 0 }}
                            markers={userCoords ? mapMarkers : []}
                            zoom={userCoords ? 12 : 2}
                        />
                    </div>
                )}

                {/* Results Section */}
                <section className="results-section">
                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                    ) : beauticians.length === 0 ? (
                        <div className="empty-state">
                            <img
                                src="/no-results.svg"
                                alt="No results found"
                                className="empty-state-image"
                            />
                            <p className="empty-state-message">No Beauticians Found Matching Your Criteria</p>
                            <button
                                onClick={clearFilters}
                                className="clear-filters-button"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <motion.div
                                className="beauticians-grid"
                                initial="hidden"
                                animate={success ? 'visible' : 'hidden'}
                                variants={{
                                    visible: {transition: {staggerChildren: 0.15}},
                                    hidden: {}
                                }}
                            >
                                {beauticians.map(beautician => (
                                    <motion.div
                                        key={beautician._id}
                                        variants={{
                                            hidden: {opacity: 0, y: 20},
                                            visible: {opacity: 1, y: 0}
                                        }}
                                    >
                                        <BeauticianCard 
                                            beautician={beautician} 
                                            showBookButton 
                                            distance={beautician.distance}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>

                            <div className="pagination">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage(page - 1)}
                                    className="pagination-button"
                                >
                                    Prev
                                </button>
                                <span className="pagination-info">Page {page} of {totalPages}</span>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className="pagination-button"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

