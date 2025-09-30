'use client';
import { useEffect, useState } from 'react';

/**
 * @typedef {Object} UserDetails
 * @property {number} userid
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} createdat
 * @property {string} linkedin_profile
 * @property {string} instagram_profile
 * @property {string} phone_number
 * @property {string} country
 * @property {string} company_email
 */

export default function UserProfile() {
  /** @type {[UserDetails|null, Function]} */
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to check auth status from localStorage
  const checkAuthStatus = () => {
    try {
      if (typeof window === 'undefined') return null;
      
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        console.log('No user data found in localStorage');
        return null;
      }

      const parsedUser = JSON.parse(userData);
      
      // Validate that the user object has the required properties
      const requiredFields = ['userid', 'name', 'email', 'role', 'createdat'];
      const isValidUser = requiredFields.every(field => field in parsedUser);
      
      if (!isValidUser) {
        console.log('Invalid user data format');
        localStorage.removeItem('user'); // Clean up invalid data
        return null;
      }

      console.log('User is authenticated:', parsedUser);
      setUserDetails(parsedUser);
      return parsedUser;
      
    } catch (err) {
      console.error('Error checking auth status:', err);
      localStorage.removeItem('user'); // Clean up corrupted data
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUserDetails(null);
    window.location.href = '/'; // Redirect to home page
  };

  useEffect(() => {
    checkAuthStatus();

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e7f3ef] to-[#d1ebdb]/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#305759] mx-auto mb-4"></div>
          <p className="text-[#305759]">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e7f3ef] to-[#d1ebdb]/30">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
            <h2 className="text-2xl font-bold text-[#305759] mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">Please log in to view your profile</p>
            <button 
              onClick={() => window.location.href = '/loginn'}
              className="bg-[#305759] text-white px-6 py-2 rounded-lg hover:bg-[#254547] transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3ef] to-[#d1ebdb]/30 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#305759]">User Profile</h1>
              <p className="text-gray-600">Welcome to your dashboard</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* User Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-[#305759] mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg font-medium">{userDetails.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg font-medium">{userDetails.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-lg font-medium capitalize">{userDetails.role.toLowerCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-lg font-medium">{new Date(userDetails.createdat).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-[#305759] mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-lg font-medium">{userDetails.phone_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Country</label>
                <p className="text-lg font-medium">{userDetails.country}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Company Email</label>
                <p className="text-lg font-medium">{userDetails.company_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                <p className="text-lg font-medium truncate">
                  <a href={userDetails.linkedin_profile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {userDetails.linkedin_profile}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Instagram</label>
                <p className="text-lg font-medium">{userDetails.instagram_profile}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-xl font-semibold text-[#305759] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/dash'}
              className="bg-[#305759] text-white px-4 py-3 rounded-lg hover:bg-[#254547] transition-colors text-center"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/Comp'}
              className="bg-[#d1ebdb] text-[#305759] px-4 py-3 rounded-lg hover:bg-[#c1e1d1] transition-colors text-center"
            >
              View Projects
            </button>
            <button 
              onClick={() => window.location.href = '/loginn?action=edit'}
              className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}