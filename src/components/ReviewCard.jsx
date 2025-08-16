import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";

export default function ReviewCard({booking, onSubmitReview, OnCancel}) {
    const [rating, setRating]=useState(0);
    const [comment, setComment]=useState("");
    const [hover, setHover]=useState(0);
    const [isSubmitting, setIsSubmitting]=useState(false);

    const handleSubmit=async()=> {
        if (rating === 0) {
            alert('Please Selct A Rating');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmitReview(booking._id, rating, comment);
        } finally {
            setIsSubmitting(false);
        }
    };
    

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Rate Your Experience</h3>
            <div className="flex items-center mb-4">
                {[...Array(5)].map((_,i) => (
                    <button
                        key={i}
                        type="button"
                        className={`${i < (hover || rating) ? 'text-yellow-500' : 'text-gray-300'} h-8 w-8 focus:outline-none`}
                        onClick={()=>setRating(i + 1)}
                        onMouseEnter={()=>setHover(i + 1)}
                        onMouseLeave={()=>setHover(0)}
                    >
                        <StarIcon className="h-full w-full"/>
                    </button>
                ))}
            </div>

            <textarea
                className="w-full p-3 border border-gray-300 rounded mb-4"
                rows="4"
                placeholder="Share details of your experience..."
                value={comment}
                onChange={(e)=>setComment(e.target.value)}
            />

            <div className="flex justify-end space-x-3">
                <button
                    onClick={OnCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-pink-300"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
        </div>   
    );
}