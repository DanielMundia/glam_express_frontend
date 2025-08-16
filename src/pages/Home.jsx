import { Link } from "react-router-dom";
import ServiceCard from "../components/ServiceCard";
import { useEffect, useState } from "react";
import axios from "axios";
import {useAuth} from "../context/AuthContext.jsx";
import "../styles/home.css";

export default function Home() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState();
    const [error, setError] = useState();
    const [showAuthPrompt, setShowAuthPrompt]=useState(false);
    const {user}=useAuth();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await axios.get("https://glam-express-backend.onrender.com/api/beauticians/services");
                setServices(res.data.data);
                setSuccess(true);
            } catch (error) {
                console.error("Error fetching services:", error);
                setError("Failed to load services. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleFindBeauticianClick=(e)=>{
        if (!user) {
            e.preventDefault();
            setShowAuthPrompt(true);
        }
        // If user is logged in, the default Link behaviour will proceed to /beauticians
    };

    return (
        <div className="home-page">
            <div className="home-container">
                {/* Hero Section */}
                <section className="hero-section">
                    <h1 className="hero-title">Book Beauty Services Instantly</h1>
                    <p className="hero-subtitle">Get Glamorous at Home or visit the Best Salons in Kenya</p>
                    <Link 
                        to="/beauticians"
                        className="cta-button"
                        onClick={handleFindBeauticianClick}
                    >
                        Find A Beautician
                    </Link>

                    {showAuthPrompt && (
                        <div className="auth-prompt">
                            <p className="auth-message">
                                You have not logged in. {" "}
                                <Link to="/login" className="auth-link login-link">
                                    Login Here
                                </Link>{" "}
                                If you have an account or{" "}
                                <Link to="/register" className="auth-link signup-link">
                                    Sign Up Here
                                </Link>{" "}
                                to register
                            </p>
                            <button
                                className="close-prompt"
                                onClick={()=>setShowAuthPrompt(false)}
                            >
                                &times;
                            </button>
                        </div>
                    )}
                </section>

                {/* Services Section */}
                <section className="services-section">
                    <h2 className="section-title">Popular Services</h2>
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            {error}
                        </div>
                    ) : (
                        <div className="services-grid">
                            {services.map((service, index) => (
                                <div
                                    key={service._id}
                                    className={`service-card-wrapper ${success ? "fade-in" : ""}`}
                                    style={{animationDelay: `${index * 0.15}s` }} // stagger effect}}
                                >
                                    <ServiceCard service={service} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}