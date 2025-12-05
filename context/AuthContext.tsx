import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { apiGetProfile, apiLogin, apiLogout, apiRegister } from '../services/mockBackend';

interface AuthContextType extends AuthState {
    login: (e: string, p: string) => Promise<void>;
    register: (e: string, p: string, n: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true
    });

    const refreshProfile = async () => {
        try {
            const user = await apiGetProfile();
            setState(prev => ({ ...prev, user, isAuthenticated: !!user, isLoading: false }));
        } catch (e) {
            setState(prev => ({ ...prev, user: null, isAuthenticated: false, isLoading: false }));
        }
    };

    useEffect(() => {
        refreshProfile();
    }, []);

    const login = async (email: string, pass: string) => {
        const user = await apiLogin(email, pass);
        setState({ user, isAuthenticated: true, isLoading: false });
    };

    const register = async (email: string, pass: string, name: string) => {
        const user = await apiRegister(email, pass, name);
        setState({ user, isAuthenticated: true, isLoading: false });
    };

    const logout = async () => {
        await apiLogout();
        setState({ user: null, isAuthenticated: false, isLoading: false });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};