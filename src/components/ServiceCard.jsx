import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ServiceCard({service}) {
    const { user} = useAuth();
    const formatPrice = (price) => {
        return price ? `KSh ${price.toLocaleString()}` : 'Price varies';
    };
    return (
        <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
            <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-3">{formatPrice(service.price)}</p>
                {user && user.role==='customer' && (
                    <Link
                        to={`/beauticians?service=${service.name}`}
                        className="text-pink-600 hover:underline">
                        Book Now →
                    </Link>
                )}
            </div>
        </div>
    );
}