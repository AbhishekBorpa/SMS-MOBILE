import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { createContext, useEffect, useState } from 'react';
import API_URL from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const login = async (email, password, role) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
                role // Include the selected role in the login request
            });

            const userData = response.data;
            setUserInfo(userData);
            setUserToken(userData.token);

            await SecureStore.setItemAsync('userInfo', JSON.stringify(userData));
            await SecureStore.setItemAsync('userToken', userData.token);

            console.log('Login successful:', userData);
        } catch (error) {
            console.log('Login error:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setUserToken(null);
        setUserInfo(null);
        await SecureStore.deleteItemAsync('userInfo');
        await SecureStore.deleteItemAsync('userToken');
        setIsLoading(false);
    };

    const changePassword = async (currentPassword, newPassword) => {
        setIsLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/auth/change-password`, { currentPassword, newPassword }, config);

            // Update local user info to reflect reset is done
            const updatedUser = { ...userInfo, isPasswordResetRequired: false };
            setUserInfo(updatedUser);
            await SecureStore.setItemAsync('userInfo', JSON.stringify(updatedUser));

            setIsLoading(false);
            return { success: true };
        } catch (error) {
            setIsLoading(false);
            return { success: false, error: error.response?.data?.message || 'Password change failed' };
        }
    };

    const isLoggedIn = async () => {
        // Safety timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth check timed out')), 5000)
        );

        try {
            setIsLoading(true);

            // Race between storage check and timeout
            await Promise.race([
                (async () => {
                    let userInfo = await SecureStore.getItemAsync('userInfo');
                    let userToken = await SecureStore.getItemAsync('userToken');

                    if (userInfo && userToken) {
                        setUserInfo(JSON.parse(userInfo));
                        setUserToken(userToken);
                    }
                })(),
                timeoutPromise
            ]);
        } catch (e) {
            console.log(`AuthContext: isLoggedIn error ${e}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    // Axios interceptor to handle 401 Unauthorized errors automatically
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    console.log('Session expired (401). Logging out...');
                    await logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, changePassword, isLoading, userToken, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};
