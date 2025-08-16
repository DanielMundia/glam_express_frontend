import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useAuth} from '../context/AuthContext';
import axios from "axios";

export default function Register() {
    const [formData, setFormData]=useState({
        name:'',
        email:'',
        password:'',
        phone:'',
        role:'customer'
    });
    const [error, setError]=useState('');
    const [loading, setLoading]=useState(false);
    const [success, setSuccess]=useState('')
    const {login}=useAuth();
    const navigate=useNavigate();

    const handleChange=(e)=>{
        const {name, value}=e.target;
        setFormData(prev=>({...prev,[name]:value}));
    };

    const handleSubmit=async(e)=>{
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const response=await axios.post('https://glam-express-backend.onrender.com/api/auth/register', formData,
                {headers: {
                    'Content-Type': 'application/json'
                }}
            );

            if (response.data.success) {
                await login(response.data.token, response.data.user);

                setSuccess("✅ Success Creating Account")
                
                let dashboardPath;
                if (response.data.user.role === 'beautician') {
                    dashboardPath ='/completeprofile' ;
            } else {
                dashboardPath = '/customerdashboard';
            }
            setTimeout(()=>{
                navigate(dashboardPath);
            }, 1500);
            console.log("SignUp Successfully");
            } else {
                setError(response.data.message || 'Registration Failed');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Registration Failed');
            console.error("Registration Failed:",error);
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
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create An Account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Join GlamExpress as a {formData.role==='beautician'?'Beautician':'Customer'}</p>
                </div>
                {/* Error message upon failure to register */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}
                {/* Success messsge upon successful sign up */}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {success}
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block-text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                value={formData.phone}
                                onChange={handleChange}
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
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Acount Type</label>
                            <div className="mt-2 flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="h-4 w-4 text-pink-600 focus:ring-pink-500"
                                        name="role"
                                        value="customer"
                                        checked={formData.role==='customer'}
                                        onChange={handleChange}
                                    />
                                    <span className="ml-2 text-gray-700">Customer</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="h-4 w-4 text-pink-600 fous:ring-pink-500"
                                        name="role"
                                        value="beautician"
                                        checked={formData.role==='beautician'}
                                        onChange={handleChange}
                                    />
                                    <span className="ml-2 text-gray-700">Beautician</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="subbmit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                        >
                            {loading ? 'Registering...':'Register'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <span className="text-gray-600">Already Have An Account?</span>
                    <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}