import { Link } from "react-router-dom";

export default function BeauticianCard({beautician}) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="relative h-48">
                <img
                    src={beautician.portfolio?.[0] || '/default-beautician.jpg'}
                    alt={beautician.userId.name}
                    className="w-full h-full object-cover"
                    />
                    {beautician.isPremium && (
                        <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Premium
                        </span>
                    )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{beautician.userId.name}</h3>
                <div className="flex items-center mb-2">
                    <span className="text-yellow-500">★ {beautician.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-500 text-sm ml-1">({beautician.totalReviews || 0})</span>
                </div>
                <div className="mb-2">
                    <p className="text-gray-600 text-sm">
                        {beautician.serviceType?.join(', ') || 'No Service Type Specified'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                    {beautician.services?.slice(0,3).map((service, index)=>(
                        <span key={index} className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">
                            {typeof service==='string' ? service : `${service.name} (KES ${service.price})`}
                        </span>
                    ))}
                </div>
                <Link
                    to={`/beauticians/${beautician._id}`}
                    className="block w-full bg-pink-600 text-white text-center py-2 rounded hover:bg-pink-700 transition"
                >
                    View Profile
                </Link>
            </div>
        </div>
    );
}