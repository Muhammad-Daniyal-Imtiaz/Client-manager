'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Building,
  Calendar,
  Phone,
  Mail,
  LogOut,
  RefreshCw,
  Shield,
  Settings,
  FileText,
  HelpCircle,
  ArrowRight,
  Briefcase,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Client {
  id: string;
  email: string;
  name: string;
  company: string;
  phone?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export default function DashboardPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  const getClientFromLocalStorage = (): Client | null => {
    if (typeof window !== 'undefined') {
      const storedClient = localStorage.getItem('client');
      return storedClient ? JSON.parse(storedClient) : null;
    }
    return null;
  };

  const clearClientFromLocalStorage = () => {
    localStorage.removeItem('client');
  };

  useEffect(() => {
    const storedClient = getClientFromLocalStorage();
    if (storedClient) {
      setClient(storedClient);
      setLoading(false);
    }
    
    checkAuthAndLoadClient();
  }, []);

  const checkAuthAndLoadClient = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (response.ok && data.client) {
        setClient(data.client);
        localStorage.setItem('client', JSON.stringify(data.client));
        setError(null);
      } else {
        clearClientFromLocalStorage();
        router.push('/login');
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      setError('Failed to load dashboard. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        clearClientFromLocalStorage();
        router.push('/login');
      } else {
        const data = await response.json();
        setError(data.error || 'Sign out failed');
      }
    } catch (err) {
      console.error('Signout error:', err);
      setError('Sign out failed. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    await checkAuthAndLoadClient();
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
            <button
              onClick={handleSignOut}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Client Portal</h1>
                <p className="text-sm text-gray-500">Professional Management Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{client.name}</p>
                <p className="text-xs text-gray-500">{client.company}</p>
              </div>
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {client.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {client.name}! 👋</h1>
                <p className="text-blue-100 text-lg">
                  Here's what's happening with your account today.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Last login: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Support Tickets</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">1</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Account Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">Active</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Full Name
                    </label>
                    <p className="text-gray-900 font-medium">{client.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email Address
                    </label>
                    <p className="text-gray-900 font-medium break-all">{client.email}</p>
                  </div>
                  {client.phone && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Phone Number
                      </label>
                      <p className="text-gray-900 font-medium">{client.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Company Information Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-green-600" />
                  Company Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Company Name</label>
                    <p className="text-gray-900 font-medium">{client.company}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Role</label>
                    <p className="text-gray-900 font-medium capitalize">{client.role || 'Client'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Member Since
                    </label>
                    <p className="text-gray-900 font-medium">
                      {client.created_at ? new Date(client.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => handleNavigation('/vclient')}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">View Projects</div>
                      <div className="text-sm text-gray-500">Check active projects</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button 
                  onClick={() => handleNavigation('/support')}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                      <HelpCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Support Tickets</div>
                      <div className="text-sm text-gray-500">Get help from our team</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button 
                  onClick={() => handleNavigation('/settings')}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Account Settings</div>
                      <div className="text-sm text-gray-500">Update your information</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button 
                  onClick={() => handleNavigation('/documents')}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Documents</div>
                      <div className="text-sm text-gray-500">Access your files</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-emerald-900">Account Status</h3>
              </div>
              <p className="text-emerald-700 text-sm mb-4">
                Your account is active and in good standing. All features are available.
              </p>
              <div className="bg-white/50 rounded-lg px-3 py-2">
                <p className="text-xs text-emerald-600 font-medium">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}