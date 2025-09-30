'use client'
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  User, 
  Settings, 
  CreditCard, 
  Activity,
  Shield,
  Mail,
  Calendar,
  PieChart,
  TrendingUp,
  Bell,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronDown,
  Moon,
  Sun,
  Home,
  Briefcase,
  FileText,
  MessageSquare,
  Heart,
  Zap,
  Star,
  Award,
  Target,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  Plus,
  LogOut,
  Save,
  X
} from 'lucide-react';

// Dummy data for users (for admin view)
const usersData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', joinDate: '2023-01-15', status: 'active', avatarColor: 'bg-blue-500' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', joinDate: '2023-02-20', status: 'active', avatarColor: 'bg-pink-500' },
  { id: 3, name: 'Robert Johnson', email: 'robert@example.com', role: 'user', joinDate: '2023-03-10', status: 'inactive', avatarColor: 'bg-gray-500' },
  { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'admin', joinDate: '2022-11-05', status: 'active', avatarColor: 'bg-purple-500' },
  { id: 5, name: 'Michael Brown', email: 'michael@example.com', role: 'user', joinDate: '2023-04-18', status: 'active', avatarColor: 'bg-green-500' },
  { id: 6, name: 'Emily Davis', email: 'emily@example.com', role: 'user', joinDate: '2023-05-22', status: 'inactive', avatarColor: 'bg-yellow-500' },
  { id: 7, name: 'David Wilson', email: 'david@example.com', role: 'admin', joinDate: '2022-08-12', status: 'active', avatarColor: 'bg-red-500' },
  { id: 8, name: 'Lisa Miller', email: 'lisa@example.com', role: 'user', joinDate: '2023-06-30', status: 'active', avatarColor: 'bg-indigo-500' },
];

// Dummy data for user dashboard (fallback)
const defaultUserDashboardData = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  joinDate: '2023-01-15',
  status: 'active',
  stats: {
    projects: 12,
    tasks: 47,
    completed: 38,
    productivity: 87
  },
  recentActivity: [
    { id: 1, action: 'Completed task', project: 'Website Redesign', time: '2 hours ago' },
    { id: 2, action: 'Uploaded file', project: 'Marketing Campaign', time: '5 hours ago' },
    { id: 3, action: 'Commented on', project: 'Product Launch', time: 'Yesterday' },
    { id: 4, action: 'Created task', project: 'UI/UX Update', time: '2 days ago' },
  ],
  performanceData: [
    { day: 'Mon', value: 75 },
    { day: 'Tue', value: 85 },
    { day: 'Wed', value: 65 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 80 },
    { day: 'Sat', value: 70 },
    { day: 'Sun', value: 85 },
  ]
};

// Dummy data for admin dashboard
const adminDashboardData = {
  name: 'Sarah Williams',
  email: 'sarah@example.com',
  role: 'admin',
  joinDate: '2022-11-05',
  status: 'active',
  platformStats: {
    totalUsers: 8,
    activeUsers: 6,
    newUsers: 2,
    storage: 75
  },
  userGrowthData: [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 160 },
    { month: 'Mar', users: 190 },
    { month: 'Apr', users: 210 },
    { month: 'May', users: 240 },
    { month: 'Jun', users: 280 },
  ]
};

// Theme options
const themes = [
  { name: 'default', bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200', header: 'bg-white', sidebar: 'bg-gray-800', chart: ['#3b82f6', '#60a5fa'] },
  { name: 'dark', bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-700', header: 'bg-gray-800', sidebar: 'bg-gray-900', chart: ['#8b5cf6', '#a78bfa'] },
  { name: 'blue', bg: 'bg-blue-50', text: 'text-gray-900', border: 'border-blue-200', header: 'bg-blue-600', sidebar: 'bg-blue-700', chart: ['#1d4ed8', '#3b82f6'] },
  { name: 'pink', bg: 'bg-pink-50', text: 'text-gray-900', border: 'border-pink-200', header: 'bg-pink-500', sidebar: 'bg-pink-600', chart: ['#be185d', '#ec4899'] },
];

// User profile interface
interface UserProfile {
  userid: number;
  name: string;
  email: string;
  role: string;
  createdat: string;
  linkedin_profile: string | null;
  instagram_profile: string | null;
  phone_number: string | null;
  country: string | null;
  company_email: string | null;
}

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(themes[0]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUserData(userData);
        setIsAdmin(userData.role === 'admin');
        
        // Fetch user details from API
        fetchUserDetails(userData.email);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserDetails = async (email: string) => {
    try {
      const response = await fetch(`/api/dash?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${currentTheme.bg} ${currentTheme.text}`}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div className={`w-64 ${currentTheme.name === 'dark' ? 'bg-gray-800' : 'bg-gray-900'} shadow-lg text-white`}>
          <div className="p-6 border-b border-gray-700 flex items-center">
            <div className="bg-pink-500 h-8 w-8 rounded-lg flex items-center justify-center mr-3">
              <Zap className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">NexusDash</h1>
          </div>
          <nav className="p-4">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-4">Main</p>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center p-3 rounded-lg bg-gray-800 text-white">
                    <Home className="h-5 w-5 mr-3" />
                    <span>Overview</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white">
                    <Briefcase className="h-5 w-5 mr-3" />
                    <span>Projects</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white">
                    <FileText className="h-5 w-5 mr-3" />
                    <span>Reports</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white">
                    <MessageSquare className="h-5 w-5 mr-3" />
                    <span>Messages</span>
                    <span className="ml-auto bg-pink-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-4">Preferences</p>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white">
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Settings</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white">
                    <Heart className="h-5 w-5 mr-3" />
                    <span>Support</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-4">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                {themes.map(theme => (
                  <button
                    key={theme.name}
                    onClick={() => setCurrentTheme(theme)}
                    className={`h-10 rounded-lg border-2 ${currentTheme.name === theme.name ? 'border-pink-500' : 'border-gray-700'}`}
                    style={{ 
                      background: theme.name === 'default' ? '#fff' : 
                                  theme.name === 'dark' ? '#1f2937' : 
                                  theme.name === 'blue' ? '#dbeafe' : '#fce7f3'
                    }}
                  >
                    <span className="sr-only">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className={`${currentTheme.header} shadow-sm ${currentTheme.border} ${currentTheme.name === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg mr-4 text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className={`pl-10 pr-4 py-2 rounded-lg ${currentTheme.name === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border-0 focus:ring-2 focus:ring-pink-500`}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className={`p-2 rounded-lg relative ${currentTheme.name === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 bg-pink-500 text-white text-xs h-4 w-4 flex items-center justify-center rounded-full">3</span>
                </button>
                
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <p className="text-sm font-medium">New message from Jane</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                      <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <p className="text-sm font-medium">Your report is ready</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                      <div className="p-4 hover:bg-gray-50">
                        <p className="text-sm font-medium">New update available</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-3"
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${isAdmin ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                    {userData?.name.charAt(0) || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {userData?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userData?.role || 'User'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium">Signed in as</p>
                      <p className="text-sm text-gray-500 truncate">{userData?.email || 'No email'}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md">Profile</button>
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md">Settings</button>
                    </div>
                    <div className="p-2 border-t border-gray-200">
                      <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 rounded-md flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Role Toggle */}
        <div className="p-6">
          <div className={`p-4 rounded-xl shadow-sm mb-6 ${currentTheme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${currentTheme.border}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Dashboard View</h2>
              <div className="flex items-center">
                <span className="mr-3 text-sm font-medium text-gray-600">User View</span>
                <button 
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${isAdmin ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
                >
                  <span className="sr-only">Toggle admin mode</span>
                  <span 
                    className={`${isAdmin ? 'translate-x-6 bg-white' : 'translate-x-1 bg-gray-50'} inline-block h-4 w-4 transform rounded-full transition-transform`}
                  />
                </button>
                <span className="ml-3 text-sm font-medium text-gray-600">Admin View</span>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <AdminDashboard data={adminDashboardData} users={usersData} activeTab={activeTab} setActiveTab={setActiveTab} theme={currentTheme} />
          ) : (
            <UserDashboard userData={userData} data={defaultUserDashboardData} activeTab={activeTab} setActiveTab={setActiveTab} theme={currentTheme} />
          )}
        </div>
      </div>
    </div>
  );
}

function UserDashboard({ userData, data, activeTab, setActiveTab, theme }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(userData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditedData(userData);
  }, [userData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/dash', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          updates: {
            name: editedData.name,
            linkedin_profile: editedData.linkedin_profile,
            instagram_profile: editedData.instagram_profile,
            phone_number: editedData.phone_number,
            country: editedData.country,
            company_email: editedData.company_email,
          }
        })
      });

      if (response.ok) {
        const updatedData = await response.json();
        setEditedData(updatedData);
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedData));
        setIsEditing(false);
      } else {
        console.error('Failed to update user data');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-pink-500 rounded-xl shadow-md p-6 text-white mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {userData?.name}!</h1>
            <p className="opacity-90">Here's what's happening with your projects today.</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
        <div className="flex mt-4 space-x-3">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex-1">
            <p className="text-xs opacity-80">Projects</p>
            <p className="text-xl font-semibold">{data.stats.projects}</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex-1">
            <p className="text-xs opacity-80">Tasks Completed</p>
            <p className="text-xl font-semibold">{data.stats.completed}/{data.stats.tasks}</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex-1">
            <p className="text-xs opacity-80">Productivity</p>
            <p className="text-xl font-semibold">{data.stats.productivity}%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`rounded-xl shadow-sm mb-6 ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['overview', 'profile', 'activity', 'projects', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-center font-medium text-sm ${activeTab === tab 
                  ? 'text-pink-500 border-b-2 border-pink-500' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'profile' ? (
        <div className={`rounded-xl shadow-sm p-6 mb-6 ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Profile Information</h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              ) : (
                <p className="p-3 bg-gray-100 rounded-lg">{userData?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="p-3 bg-gray-100 rounded-lg">{userData?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.phone_number || ''}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              ) : (
                <p className="p-3 bg-gray-100 rounded-lg">{userData?.phone_number || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.country || ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              ) : (
                <p className="p-3 bg-gray-100 rounded-lg">{userData?.country || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.linkedin_profile || ''}
                  onChange={(e) => handleChange('linkedin_profile', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              ) : (
                <p className="p-3 bg-gray-100 rounded-lg">{userData?.linkedin_profile || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Profile</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.instagram_profile || ''}
                  onChange={(e) => handleChange('instagram_profile', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              ) : (
                <p className="p-3 bg-gray-100 rounded-lg">{userData?.instagram_profile || 'Not provided'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedData?.company_email || ''}
                  onChange={(e) => handleChange('company_email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              ) : (
                <p className="p-3 bg-gray-100 rounded-lg">{userData?.company_email || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl shadow-sm ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Projects</p>
                      <p className="text-2xl font-semibold">{data.stats.projects}</p>
                    </div>
                  </div>
                  <div className="text-green-500 text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    12%
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-sm ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-green-100">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tasks</p>
                      <p className="text-2xl font-semibold">{data.stats.tasks}</p>
                    </div>
                  </div>
                  <div className="text-red-500 text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    5%
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-sm ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-amber-100">
                      <PieChart className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-semibold">{data.stats.completed}</p>
                    </div>
                  </div>
                  <div className="text-green-500 text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    22%
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-sm ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-100">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Productivity</p>
                      <p className="text-2xl font-semibold">{data.stats.productivity}%</p>
                    </div>
                  </div>
                  <div className="text-green-500 text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    8%
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className={`p-6 rounded-xl shadow-sm ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Performance</h2>
                <div className="flex items-center text-sm text-gray-500">
                  This week
                  <ChevronDown className="h-4 w-4 ml-1" />
                </div>
              </div>
              <div className="h-48 flex items-end space-x-1">
                {data.performanceData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-pink-500 rounded-t-lg"
                      style={{ height: `${day.value}%` }}
                    ></div>
                    <span className="text-xs mt-2 text-gray-500">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Recent Activity */}
            <div className={`lg:col-span-2 rounded-xl shadow-sm p-6 ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Recent Activity</h2>
                <button className="text-sm text-pink-500 flex items-center">
                  View all
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center text-white">
                        <User className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium">{activity.action} <span className="text-pink-500">{activity.project}</span></p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`rounded-xl shadow-sm p-6 ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
              <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="flex items-center w-full p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
                  <CreditCard className="h-5 w-5 text-gray-500 mr-3" />
                  <span>Billing</span>
                </button>
                <button className="flex items-center w-full p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
                  <Settings className="h-5 w-5 text-gray-500 mr-3" />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center w-full p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <User className="h-5 w-5 text-gray-500 mr-3" />
                  <span>Profile</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AdminDashboard({ data, users, activeTab, setActiveTab, theme }) {
  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md p-6 text-white mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="opacity-90">Welcome back, {data.name}. Here's the overview of your platform.</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2">
            <Award className="h-5 w-5" />
          </div>
        </div>
        <div className="flex mt-4 space-x-3">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex-1">
            <p className="text-xs opacity-80">Total Users</p>
            <p className="text-xl font-semibold">{data.platformStats.totalUsers}</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex-1">
            <p className="text-xs opacity-80">Active Users</p>
            <p className="text-xl font-semibold">{data.platformStats.activeUsers}</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 flex-1">
            <p className="text-xs opacity-80">Storage</p>
            <p className="text-xl font-semibold">{data.platformStats.storage}%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`rounded-xl shadow-sm mb-6 ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['overview', 'users', 'analytics', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-center font-medium text-sm ${activeTab === tab 
                  ? 'text-pink-500 border-b-2 border-pink-500' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl shadow-sm ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold">{data.platformStats.totalUsers}</p>
                </div>
              </div>
              <div className="text-green-500 text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                18%
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-semibold">{data.platformStats.activeUsers}</p>
                </div>
              </div>
              <div className="text-green-500 text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                7%
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-amber-100">
                  <User className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Users</p>
                  <p className="text-2xl font-semibold">{data.platformStats.newUsers}</p>
                </div>
              </div>
              <div className="text-red-500 text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                3%
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Storage</p>
                  <p className="text-2xl font-semibold">{data.platformStats.storage}%</p>
                </div>
              </div>
              <div className="text-green-500 text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                2%
              </div>
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className={`p-6 rounded-xl shadow-sm ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">User Growth</h2>
            <div className="flex items-center text-sm text-gray-500">
              This year
              <ChevronDown className="h-4 w-4 ml-1" />
            </div>
          </div>
          <div className="h-48 flex items-end space-x-1">
            {data.userGrowthData.map((month, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg"
                  style={{ height: `${month.users / 3}%` }}
                ></div>
                <span className="text-xs mt-2 text-gray-500">{month.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className={`rounded-xl shadow-sm p-6 mb-6 ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Users Management</h2>
          <button className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
        <div className="flex space-x-2 mb-4">
          <div className={`flex items-center px-3 py-2 rounded-lg border ${theme.name === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'} flex-1`}>
            <Search className="h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className={`ml-2 bg-transparent border-none focus:outline-none w-full ${theme.name === 'dark' ? 'text-white' : 'text-gray-900'}`}
            />
          </div>
          <button className={`p-2 rounded-lg border ${theme.name === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
            <Filter className="h-4 w-4" />
          </button>
          <button className={`p-2 rounded-lg border ${theme.name === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
            <Download className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${user.avatarColor} text-white`}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joinDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`rounded-xl shadow-sm p-6 ${theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme.border}`}>
        <h2 className="text-lg font-medium mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 rounded-lg border border-gray-300 hover:border-pink-500 hover:bg-pink-50 text-gray-700">
            <Shield className="h-5 w-5 text-gray-500 mr-2" />
            <span>Permissions</span>
          </button>
          <button className="flex items-center justify-center p-4 rounded-lg border border-gray-300 hover:border-pink-500 hover:bg-pink-50 text-gray-700">
            <Mail className="h-5 w-5 text-gray-500 mr-2" />
            <span>Send Email</span>
          </button>
          <button className="flex items-center justify-center p-4 rounded-lg border border-gray-300 hover:border-pink-500 hover:bg-pink-50 text-gray-700">
            <Settings className="h-5 w-5 text-gray-500 mr-2" />
            <span>System Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}