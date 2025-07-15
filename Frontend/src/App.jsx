import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import LoginForm from './components/LoginForm';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  
  // Check if user has admin privileges (for demo, we'll consider a specific address as admin)
  const isAdmin = user?.address === "0x123456789AbCdEf123456789AbCdEf123456789A";
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar isAdmin={isAdmin} />}
        <main className="flex-1 p-6 overflow-auto">
          {!isAuthenticated ? (
            <LoginForm />
          ) : isAdmin ? (
            <AdminDashboard />
          ) : (
            <UserDashboard />
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;