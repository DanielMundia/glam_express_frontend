import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
    const [email, setEmail]=useState("");
    const [error, setError]=useState("");
    const [loading, setLoading]=useState(false);
    const [message, setMessage]=useState("");

    const handleSubmit=async(e)=>{
        e.preventDefault();
        try {
            setError("");
            setMessage("");
            setLoading(true);

            const response=await axios.post(
                "https://glam-express-backend.onrender.com/api/auth/forgot-password", {email}
            );
            setMessage(response.data?.message || "Password reset instructions have been sent to your email");
            console.log("Password reset email sent successfully");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to rest email");
            console.log("Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset Your Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email address and we'll send you instructions to reset your password
                    </p>
                </div>

                {error && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {message}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Reset instructions"}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}