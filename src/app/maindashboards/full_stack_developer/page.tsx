"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  FileText,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default function ProjectManagerDashboard() {
  const router = useRouter();
  const [active, setActive] = useState("Dashboard");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { name: "Dashboard", icon: Home },
    { name: "Projects", icon: FileText },
    { name: "Team", icon: Users },
    { name: "Calendar", icon: Calendar },
    { name: "Tasks", icon: CheckCircle },
    { name: "Reports", icon: BarChart3 },
    { name: "Settings", icon: Settings },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (response.ok && data.user) {
        setUser(data.user);
      } else {
        window.location.href = '/role-selection';
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      window.location.href = '/role-selection';
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Error logging out:', err);
      // Still redirect to login if there's an error
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-gray-100 to-pink-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Project Manager Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-gray-100 to-pink-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 shadow-xl border-r border-gray-200 backdrop-blur-md flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <Badge className="mt-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs">
                Project Manager
              </Badge>
            </div>
          </div>
          {user.roleData && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span>Team Size: {user.roleData.team_size || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <span>Success Rate: {user.roleData.success_rate || 0}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 text-xl font-bold text-purple-700 text-center border-b border-gray-200">
          Project Manager
        </div>
        
        <nav className="flex-1">
          {menuItems.map((item) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={item.name}
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all duration-200 ${
                active === item.name
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                  : "text-gray-700 hover:bg-purple-50"
              }`}
              onClick={() => setActive(item.name)}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </motion.div>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your projects and team efficiently</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold mt-1">8</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold mt-1">12</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tasks Due</p>
                  <p className="text-2xl font-bold mt-1">24</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Budget Used</p>
                  <p className="text-2xl font-bold mt-1">78%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Manager Profile */}
        <Card className="border-0 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle>Project Manager Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600">Full Name</label>
                      <p className="text-lg font-medium">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="text-lg font-medium">{user.email}</p>
                    </div>
                    {user.phone && (
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="text-lg font-medium">{user.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
                  {user.roleData && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Department</label>
                        <p className="text-lg font-medium">{user.roleData.department || 'Project Management'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Manager Level</label>
                        <Badge className="bg-purple-100 text-purple-800">
                          {user.roleData.manager_level || 'Mid-level'}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Experience</label>
                        <p className="text-lg font-medium">{user.roleData.years_experience || 1} years</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}