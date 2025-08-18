import './index.css';
import { LoadScript } from '@react-google-maps/api';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Login from './pages/Login';
import Register from './pages/Register';
import BeauticianCompleteProfile from './pages/BeauticianCompleteProfile';
import Beauticians from './pages/Beauticians';
import BeautiacianProfile from "./pages/BeauticianProfile";
import BeauticianDashboard from './pages/BeauticianDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Bookings from './pages/Bookings';
import Payment from './pages/Payment';
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <Router>
          <div className='App'>
            <Header />
            <main className='min-h-screen'>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/completeprofile' element={<BeauticianCompleteProfile />} />
                <Route path='/beauticiandashboard' element={<BeauticianDashboard />} />
                <Route path='/customerdashboard' element={<CustomerDashboard />} /> 
                <Route path='/beauticians' element={<Beauticians />} />
                <Route path='/beauticians/:id' element={<BeautiacianProfile />} />
                <Route path='/bookings' element={<Bookings />} />
                <Route path='/payment/:bookingId?' element={<Payment />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </LoadScript>
    </AuthProvider>
  );
}


export default App;
