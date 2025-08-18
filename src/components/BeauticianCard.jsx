import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

const API_BASE = "https://glam-express-backend.onrender.com";

const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-beautician.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}/${imagePath.replace(/^\//, "")}`;
};

export default function BeauticianCard({ beautician, distance }) {
    const imgSrc = getImageUrl(beautician?.profilePhoto);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="relative h-48">
                <img
                    src={imgSrc}
                    alt={beautician?.userId?.name || "Beautician"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-beautician.jpg";
                    }}
                />
                {beautician?.isPremium && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Premium
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{beautician?.userId?.name}</h3>
                <div className="flex items-center mb-2">
                    <span className="text-yellow-500">★ {beautician?.rating?.toFixed(1) || "0.0"}</span>
                    <span className="text-gray-500 text-sm ml-1">({beautician?.totalReviews || 0})</span>
                </div>
                <div className="flex items-center mb-3 text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-1" />
                    <div>
                        <p>{beautician?.salonAddress}</p>
                        {distance !== undefined && (
                            <p className="text-xs text-gray-500">{distance.toFixed(1)} km away</p>
                        )}
                    </div>
                </div>
                <div className="mb-2">
                    <p className="text-gray-600 text-sm">
                        {beautician?.serviceType?.join(", ") || "No Service Type Specified"}
                    </p>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                    {beautician?.services?.slice(0, 3).map((service, index) => (
                        <span key={index} className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">
                            {typeof service === "string" ? service : `${service.name} (KES ${service.price})`}
                        </span>
                    ))}
                </div>
                <Link
                    to={`/beauticians/${beautician?._id}`}
                    className="block w-full bg-pink-600 text-white text-center py-2 rounded hover:bg-pink-700 transition"
                >
                    View Profile
                </Link>
            </div>
        </div>
    );
}