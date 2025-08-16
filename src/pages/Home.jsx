import { Link } from "react-router-dom";
import ServiceCard from "../components/ServiceCard";
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/home.css"; // Import the CSS file

export default function Home() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState();
    const [error, setError] = useState();

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
                    >
                        Find A Beautician
                    </Link>
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