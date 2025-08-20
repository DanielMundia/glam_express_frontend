import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
    const [password, setPassword]=useState("");
    const [confirmPassword, setConfirmPassword]=useState("");
    const [error, setError]=useState("");
    const [loading, setLoading]=useState(false);
    const [message, setMessage]=useState("");
    const [validToken, setValidToken]=useState(false);
    const navigate=useNavigate();
    const [searchParams]=useSearchParams();
    const token=searchParams.get("token");

    useEffect(()=>{
        // Verify token is valid when component mounts
        const verifyToken=async()=> {
            try {
                const response=await axios.get(
                    `https://glam-express-backend.onrender.com/api/auth/verify-reset-token?token=${token}`
                );
                if (response.status === 200) {
                    setValidToken(true);
                }
            } catch (error) {
                setError("Invalid or expired rest token");
                setValidToken(false);
            }
        };

        if (token) {
            verifyToken();
        } else {
            setError("No reset token provided");
        }
    }, [token]);

    const handleSubmit=async(e)=> {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setError("");
            setMessage("");
            setLoading(true);

            const response=await axios.post(
                "https://glam-express-backend.onrender.com/api/auth/reset-password", {token, password}
            );
            setMessage(response.data?.message || "Password reset successfully. Redirecting to Login...")
            console.log("Reset Password response:", response.data);
            setTimeout(()=> {
                navigate("/login");
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    if (!validToken && error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                    <div className="text-center">
                        <Link to="/forgot-password" className="font-medium text-pink-600 hover:text-pink-500">
                            Request a new reset link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Set New Password
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {message}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                value={password}
                                onChange={(e)=>setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword"  className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                autoComplete="new-password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                value={confirmPassword}
                                onChange={(e)=>setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
                        Back To Login
                    </Link>
                </div>
            </div>
        </div>
    );
}