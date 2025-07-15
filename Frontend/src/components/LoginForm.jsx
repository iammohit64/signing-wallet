import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
  const { loginWithWallet, error, loading } = useAuth();
  const [additionalInfo, setAdditionalInfo] = useState({
    name: '',
    email: '',
    contactNumber: ''
  });
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  
  const handleConnectWallet = async () => {
    try {
      await loginWithWallet(additionalInfo);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdditionalInfo(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Connect to ZeroLag
      </h2>
      
      <p className="text-gray-600 mb-8 text-center">
        Connect your wallet to get started with task tracking and staking
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <button
        onClick={handleConnectWallet}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
            <span>Connect Wallet</span>
          </>
        )}
      </button>
      
      <div className="mt-6">
        <button 
          type="button" 
          onClick={() => setShowOptionalFields(!showOptionalFields)}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          {showOptionalFields ? 'Hide' : 'Add'} optional information
          <svg 
            className={`ml-1 h-4 w-4 transform ${showOptionalFields ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showOptionalFields && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={additionalInfo.name}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={additionalInfo.email}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={additionalInfo.contactNumber}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;