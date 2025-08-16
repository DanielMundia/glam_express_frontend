import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import {jwtDecode} from 'jwt-decode';

const AuthContext=createContext({
    user:null,
    loading:true,
    login:()=>{},
    logout:()=>{}
});

export function AuthProvider({children}) {
    const [user, setUser]=useState(null);
    const [loading, setLoading]=useState(true);

    useEffect(()=>{
        const inititializeAuth=async()=>{
                const token=localStorage.getItem('token');
                if (token) {
                    try {
                        const decoded=jwtDecode(token);
                        // Store both decoded data and the raw token
                        setUser({...decoded, token});
                        axios.defaults.headers.common['Authorization']=`Bearer ${token}`;
                    } catch (error) {
                        console.error("Invalid token", error);
                        localStorage.removeItem('token');
                    }        
            }
            setLoading(false);
        };
        inititializeAuth();
    }, []);

    const login=(token, userData)=>{
        // Validate the user role
        if (!['customer', 'beautician'].includes(userData?.role)) {
            console.error("Invalid user role:", userData?.role);
            return;
        }
        localStorage.setItem('token',token);
        axios.defaults.headers.common['Authorization']=`Bearer ${token}`;
        // Store both userData (decoded payload) and the raw token
        setUser({...userData, token});
    };

    const logout=()=>{
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context=useContext(AuthContext);
    if (context===undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}