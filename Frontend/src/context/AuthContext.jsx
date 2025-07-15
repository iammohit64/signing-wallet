import React, { createContext, useContext, useState, useEffect } from 'react';
import { connectWallet, addWalletListener } from '../utils/web3';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize authentication state
  useEffect(() => {
    // Check if user exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user data");
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
    
    // Setup wallet change listener
    if (user && user.address) {
      addWalletListener(address => {
        if (address && address !== user.address) {
          // Update user with new address
          updateUser({ ...user, address });
        } else if (!address && user) {
          // User disconnected wallet
          logout();
        }
      });
    }
  }, []);
  
  // Connect wallet and set user
  const loginWithWallet = async (userData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const walletData = await connectWallet();
      
      // Create user object with wallet and optional profile data
      const newUser = {
        address: walletData.address,
        network: walletData.network,
        ...userData
      };
      
      // Save to state and localStorage
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return newUser;
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Update user profile
  const updateUser = (userData) => {
    // Merge with existing user data
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };
  
  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  // Auth context value
  const value = {
    user,
    loading,
    error,
    loginWithWallet,
    updateUser,
    logout,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth hook for easier access to auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};