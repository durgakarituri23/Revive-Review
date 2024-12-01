import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to fetch user details using the token
    const fetchUserDetails = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get('http://localhost:8000/user/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(response.data);
                // Store email when fetching user details
                localStorage.setItem('userEmail', response.data.email);
                localStorage.setItem('userRole', response.data.role);
            } catch (error) {
                console.error('Error fetching user details:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                setUser(null);
            }
        }
        setLoading(false);
    };

    // Function to handle login
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8000/login', {
                email,
                password
            });

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                await fetchUserDetails();
                return response.data;
            }
        } catch (error) {
            throw error;
        }
    };

    // Function to handle logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        setUser(null);
    };

    // Check for token and fetch user details on mount
    useEffect(() => {
        fetchUserDetails();
    }, []);

    const value = {
        user,
        login,
        logout,
        loading,
        userEmail: user?.email || localStorage.getItem('userEmail'),
        userRole: user?.role || localStorage.getItem('userRole')
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};