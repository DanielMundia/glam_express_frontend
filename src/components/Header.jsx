import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserIcon, ShoppingBagIcon, ScissorsIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import '../styles/header.css';

export default function Header() {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;
    
    if (loading) {
        return (
          <header className="bg-pink-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div>Loading...</div>
            </div>
          </header>
        );
    }
    
    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    return(
        <header className="bg-pink-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* 👇 FIXED: Added null check for user and profilePhoto */}
                {user?.profilePhoto ? (
                    <img
                        src={user.profilePhoto}
                        className="h-8 w-8 rounded-full mr-2"
                        alt="Profile"
                    />
                ) : user ? (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                ) : null}

                <Link to="/" className="text-2xl font-bold">
                    GlamExpress
                </Link>
                
                <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/beauticians" className={`hover:underline ${isActive('/beauticians') ? 'font-bold underline' : ''}`}>
                        Beauticians
                    </Link>
                    
                    {/* 👇 FIXED: Only show auth links when user exists */}
                    {user ? (
                        <>
                            <Link to="/bookings" className={`hover:underline ${isActive('/bookings') ? 'font-bold underline' : ''}`}>
                                {user?.role === 'beautician' ? 'My Appointments' : 'My Bookings'}
                            </Link>
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                3
                            </span>
                            {user && user.role === 'beautician' ? (
                                <Link to="/beauticiandashboard" className={`flex items-center space-x-1 ${isActive('/beauticiandashboard') ? 'font-bold underline' : ''}`}>
                                    <ScissorsIcon className="h-5 w-5"/>
                                    <span>Beautician's Dashboard</span>
                                </Link>
                            ) : user && user.role === 'customer' ? (
                                <Link to="/customerdashboard" className={`flex items-center space-x-1 ${isActive('/customerdashboard') ? 'font-bold underline' : ''}`}>
                                    <ShoppingBagIcon className="h-5 w-5"/>
                                    <span>Customer's Dashboard</span>
                                </Link>
                            ) : null}
                            <button onClick={logout} className="hover:underline">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={`hover:underline ${isActive('/login') ? 'font-bold underline' : ''}`}>
                                Login
                            </Link>
                            <Link to="/register" className={`hover:underline ${isActive('/register') ? 'font-bold underline' : ''}`}>
                                Register
                            </Link>
                        </>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 rounded-md focus:outline-none"
                    onClick={toggleMobileMenu}
                >
                    {mobileMenuOpen ? (
                        <XMarkIcon className="h-6 w-6"/>
                    ) : (
                        <Bars3Icon className="h-6 w-6"/>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-pink-700 pb-4 px-4">
                    <nav className="flex flex-col space-y-4">
                        <Link
                            to="/beauticians"
                            className={`hover:underline py-2 ${isActive('/beauticians') ? 'font-bold underline' : ''}`}
                            onClick={toggleMobileMenu}
                        >
                            Beauticians
                        </Link>
                        {user ? (
                            <>
                                <Link
                                    to="/bookings"
                                    className={`hover:underline py-2 ${isActive('/bookings') ? 'font-bold underline' : ''}`}
                                    onClick={toggleMobileMenu}
                                >
                                    My Bookings
                                </Link>
                                {user.role === 'beautician' ? (
                                    <Link
                                        to="/beauticiandashboard"
                                        className={`flex items-center space-x-1 py-2 ${isActive('/beauticiandashboard') ? 'font-bold underline' : ''}`}
                                        onClick={toggleMobileMenu}
                                    >
                                        <ScissorsIcon className="h-5 w-5"/>
                                        <span>Beautician's Dashboard</span>
                                    </Link>
                                ) : (
                                    <Link
                                        to="/customerdashboard"
                                        className={`flex items-center space-x-1 py-2 ${isActive('/customerdashboard') ? 'font-bold underline' : ''}`}
                                        onClick={toggleMobileMenu}
                                    >
                                        <ShoppingBagIcon className="h-5 w-5"/>
                                        <span>Customer's dashboard</span>
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        logout();
                                        toggleMobileMenu();
                                    }}
                                    className="hover:underline py-2 text-left"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={`hover:underline py-2 ${isActive('/login') ? 'font-bold underline' : ''}`}
                                    onClick={toggleMobileMenu}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className={`hover:underline py-2 ${isActive('/register') ? 'font-bold underline' : ''}`}
                                    onClick={toggleMobileMenu}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}