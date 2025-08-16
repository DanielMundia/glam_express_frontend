import { Link } from 'react-router-dom';
import {EnvelopeIcon, PhoneIcon, ShareIcon} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function Footer(){
    const {user}=useAuth();
    return (
        <footer className='bg-gray-800 text-white py-8'>
            <div className='container mx-auto px-4'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
                    <div>
                        <h3 className='text-xl font-bold mb-4'>GlamExpress</h3>
                        <p className='text-gray-300'>Your on-demand beauty service platform in Kenya.</p>
                    </div>
                    <div>
                        <h4 className='font-semibold mb-4'>Quick Links</h4>
                        <ul className='space-y-2'>
                            <li><Link to="/beauticians" className='hover:text-pink-400'>Find Beauticians</Link></li>
                            <li><Link to="/bookings" className='hover:text-pink-400'>{user?.role==='beautician' ? 'My Appointments' : 'My Bookings'}</Link></li>
                            <li>{user?.role==='beautician' ? (
                                <Link to="/beauticiandashboard" className='hover:text-pink-400'>Beautician's Dashboard</Link>
                            ) : (
                                <Link to="/customerdashboard" className='hover:text-pink-400'>Customer Dashboard</Link>
                            )} 
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className='font-semibold mb-4'>Company</h4>
                        <div className='flex space-x-4'>
                            <a href="#" className='hover:text-pink-400'><EnvelopeIcon className="h-6 w-6" /></a>
                            <a href="#" className='hover:text-pink-400'><PhoneIcon className="h-6 w-6" /></a>
                            <a href="#" className='hover:text-pink-400'><ShareIcon className="h-6 w-6" /></a>
                        </div>
                    </div>
                </div>
                <div className='border-t border-gray-700 mt-8 pt-6 text-center text-gray-400'>
                    <p>&copy; {new Date().getFullYear()} GlamExpress. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}