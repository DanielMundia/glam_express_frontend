import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useAuth} from '../context/AuthContext';
import axios from "axios";

export default function Login() {
    const [email, setEmail]=useState('');
    const [password, setPassword]=useState('');
    const [error, setError]=useState('');
    const [loading, setLoading]=useState(false);
    const [success, setSuccess]=useState('');
    const {login}=useAuth();
    const navigate=useNavigate();

    const handleSubmit=async(e)=>{
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const response=await axios.post('https://glam-express-backend.onrender.com/api/auth/login', {email,password});
            login(response.data.token, response.data.user);
            setSuccess("✅ Login Successful")
            const dashboardPath=response.data.user.role === 'beautician' ? '/beauticiandashboard' : response.data.user.role === 'customer' ? '/customerdashboard' : '/' // Fallback for both roles
            setTimeout(()=> {
                navigate(dashboardPath);
            }, 1500);
            console.log("Login Successfully done")
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
            console.log("Login Failed...feilya")
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
    return <div>Loading authentication...</div>;
  }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign In to Your Account
                    </h2>
                </div>
                {/* Error message upon failure to login */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}
                {/* Success message upon successful login */}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {success}
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
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
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                value={password}
                                onChange={(e)=>setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember-me"
                                name="remember-me"
                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember Me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-pink-600 hover:text-pink-500">
                                Forgot Your Password
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            classname="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                        >
                            {loading?'Signing in...':'Sign in'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-danger">
                    <span className="text-gray-600">Don't Have An Account?</span>
                    <Link to="/register" className="font-medium text-pink-600 hover:text-pink-500">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}