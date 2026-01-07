"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  roleData?: any;
}

export default function DashboardRedirect() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Use server-side session endpoint which has proper database access
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        console.log('Session endpoint returned status:', response.status);
        if (response.status === 401) {
          router.push('/login');
        } else {
          // Server error - wait and retry
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
        return;
      }

      const data = await response.json();
      
      if (!data.user) {
        console.log('No user data in session response');
        router.push('/login');
        return;
      }

      setUser(data.user);
      redirectBasedOnRole(data.user);
    } catch (err) {
      console.error('Error checking auth status:', err);
      // Wait a moment and retry
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (userData: UserData) => {
    switch (userData.role) {
      case 'client':
        router.push('/dashboard/client');
        break;
      case 'project_manager':
        router.push('/dashboard/project-manager');
        break;
      case 'full_stack_developer':
        router.push('/maindashboards/full_stack_developer');
        break;
      case 'lead_full_stack_developer':
        router.push('/maindashboards/full_stack_developer');
        break;
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'seo_developer':
        router.push('/dashboard/seo');
        break;
      default:
        router.push('/dashboard/client'); // Default fallback
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Redirecting to your dashboard...</h2>
          <p className="text-gray-600 mt-2">Please wait while we set up your workspace</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Redirecting...</h2>
        <p className="text-gray-600 mt-2">Taking you to your {user.role.replace(/_/g, ' ')} dashboard</p>
      </div>
    </div>
  );
} 