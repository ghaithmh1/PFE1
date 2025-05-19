import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [entreprise, setEntreprise] = useState(null);

    const login = async (credentials) => {
        const response = await axios.post('/api/auth/login', credentials);
        const { token, userDetails } = response.data;
        localStorage.setItem('token', token);
        setUser(userDetails);
        setEntreprise(userDetails.entreprise);
    };

    const loadUser = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            setUser(response.data);
            setEntreprise(response.data.entreprise);
        } catch (error) {
            console.error('Failed to load user:', error);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setEntreprise(null);
    };

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, entreprise, login, logout, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);