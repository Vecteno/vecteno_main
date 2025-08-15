'use client'
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';

export const AppContext = createContext(); // ✅ Correct name

export const AppContextProvider = ({ children }) => {
    axios.defaults.withCredentials = true;

    // Use current origin in browser, fallback to localhost:3000 in SSR
    const [backendUrl, setBackendUrl] = useState('http://localhost:3000');
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Set the correct backend URL once mounted
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBackendUrl(window.location.origin);
        }
    }, []);

    const getAuthState = async () => {
        try {
            console.log('Attempting to connect to:', backendUrl + '/api/profileInfo');
            const { data } = await axios.get(backendUrl + '/api/profileInfo');
            if (data.success) {
                setIsLoggedin(true);
                getUserData();  
            }
        } catch (error) {
            console.log('Auth check failed - this is normal if not logged in');
            // Silently handle auth errors as they're expected when not logged in
        }
    }

    const getUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/profileInfo');
            if (data.success) {
                setUserData(data.user);
            }
        } catch (error) {
            // Don't show error toast for authentication failures - this is expected
            if (error.response?.status !== 401) {
                console.error("User data fetch error:", error.message);
            }
        }
    }

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            getAuthState();
        }
    }, [mounted]);

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        mounted
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}
