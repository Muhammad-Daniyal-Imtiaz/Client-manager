"use client";

import { useState, useEffect } from "react";
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
  Building,
  Phone,
  ArrowRight,
  Briefcase,
  Code,
  Shield,
  Search as SearchIcon,
  UserCog,
  BarChart3,
  Calendar,
  Award,
  Lock,
  Key
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

export default function Dashboard() {
  const [active, setActive] = useState("Home");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const getRoleMenuItems = (role: string) => {
    const baseItems = [
      { name: "Home", icon: Home },
      { name: "Applications", icon: FileText },
      { name: "Users", icon: Users },
      { name: "Settings", icon: Settings },
    ];

    switch (role) {
      case 'client':
        return [
          ...baseItems,
          { name: "Projects", icon: Building },
          { name: "Analytics", icon: BarChart3 }
        ];
      case 'project_manager':
        return [
          ...baseItems,
          { name: "Team", icon: Users },
          { name: "Timeline", icon: Calendar },
          { name: "Reports", icon: FileText }
        ];
      case 'full_stack_developer':
      case 'lead_full_stack_developer':
        return [
          ...baseItems,
          { name: "Tasks", icon: Code },
          { name: "Code", icon: Code },
          { name: "Review", icon: Shield }
        ];
      case 'admin':
        return [
          ...baseItems,
          { name: "Admin Panel", icon: Shield },
          { name: "Audit Log", icon: FileText },
          { name: "Permissions", icon: Lock }
        ];
      case 'seo_developer':
        return [
          ...baseItems,
          { name: "SEO Tools", icon: SearchIcon },
          { name: "Keywords", icon: Key },
          { name: "Analytics", icon: BarChart3 }
        ];
      default:
        return baseItems;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return Building;
      case 'project_manager':
        return Briefcase;
      case 'full_stack_developer':
      case 'lead_full_stack_developer':
        return Code;
      case 'admin':
        return Shield;
      case 'seo_developer':
        return SearchIcon;
      default:
        return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client':
        return "bg-blue-500";
      case 'project_manager':
        return "bg-purple-500";
      case 'full_stack_developer':
        return "bg-green-500";
      case 'lead_full_stack_developer':
        return "bg-orange-500";
      case 'admin':
        return "bg-red-500";
      case 'seo_developer':
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleStats = (role: string, roleData: any) => {
    switch (role) {
      case 'client':
        return [
          { label: "Active Projects", value: roleData?.project_count || 0, icon: Briefcase, color: "text-blue-600" },
          { label: "Company Size", value: roleData?.company_size || "1-10", icon: Users, color: "text-purple-600" },
          { label: "Budget Range", value: roleData?.budget_range || "<10k", icon: BarChart3, color: "text-green-600" },
        ];
      case 'project_manager':
        return [
          { label: "Active Projects", value: roleData?.active_projects || 0, icon: Briefcase, color: "text-blue-600" },
          { label: "Team Size", value: roleData?.team_size || 0, icon: Users, color: "text-purple-600" },
          { label: "Success Rate", value: `${roleData?.success_rate || 0}%`, icon: Award, color: "text-green-600" },
        ];
      case 'full_stack_developer':
        return [
          { label: "Current Projects", value: roleData?.current_projects || 0, icon: Code, color: "text-blue-600" },
          { label: "Tech Stack", value: roleData?.tech_stack?.length || 0, icon: Code, color: "text-purple-600" },
          { label: "Experience", value: `${roleData?.years_experience || 0} years`, icon: Award, color: "text-green-600" },
        ];
      case 'admin':
        return [
          { label: "Admin Level", value: roleData?.admin_level || "Moderator", icon: Shield, color: "text-blue-600" },
          { label: "Permissions", value: roleData?.permissions?.length || 0, icon: Lock, color: "text-purple-600" },
          { label: "Last Audit", value: "Today", icon: Calendar, color: "text-green-600" },
        ];
      default:
        return [
          { label: "Total Applications", value: "1,245", icon: FileText, color: "text-green-600" },
          { label: "Active Users", value: "3,498", icon: Users, color: "text-blue-600" },
          { label: "Pending Approvals", value: "76", icon: AlertTriangle, color: "text-red-600" },
        ];
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (response.ok && data.user) {
        setUser(data.user);
      } else {
        window.location.href = '/role-selection';
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      window.location.href = '/role-selection';
    } finally {
      setLoading(false);
    }
  };

  const handleSignout = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Signout error:', err);
    }
  };

  const navigateToVClient = () => {
    window.location.href = '/vclient';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-green-100 via-gray-100 to-green-200 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-green-100 via-gray-100 to-green-200 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Not authenticated</p>
          <Button onClick={() => window.location.href = '/role-selection'} className="mt-4">
            Select Role
          </Button>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(user.role);
  const roleColor = getRoleColor(user.role);
  const menuItems = getRoleMenuItems(user.role);
  const roleStats = getRoleStats(user.role, user.roleData);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 via-gray-100 to-green-200 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 shadow-xl border-r border-gray-200 backdrop-blur-md flex flex-col">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-12 w-12 rounded-full ${roleColor} flex items-center justify-center`}>
              <RoleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <Badge className={`mt-1 ${roleColor.replace('bg-', 'bg-')} text-white text-xs`}>
                {user.role.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {user.roleData && user.role === 'client' && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4" />
                <span className="truncate">{user.roleData.company_name}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.last_login && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Last login: {new Date(user.last_login).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 text-xl font-bold text-green-700 text-center border-b border-gray-200">
          {user.role.replace(/_/g, ' ')} Dashboard
        </div>
        
        <nav className="flex-1">
          {menuItems.map((item) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              key={item.name}
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all duration-200 ${
                active === item.name
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-green-100"
              }`}
              onClick={() => setActive(item.name)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </motion.div>
          ))}
        </nav>
        
        <div className="p-6 border-t border-gray-200 space-y-3">
          <Button 
            onClick={navigateToVClient}
            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Users className="h-4 w-4" />
            Go to Clients
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={handleSignout}
          >
            <LogOut className="h-4 w-4" /> 
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{active}</h1>
            <p className="text-gray-600">
              Welcome back, {user.name}! Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* User Profile Card */}
        {active === "Home" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Your Profile - {user.role.replace(/_/g, ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-lg font-semibold">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg font-semibold">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <Badge className={`${roleColor.replace('bg-', 'bg-')} text-white`}>
                        {user.role.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {user.role === 'client' && user.roleData && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Company</label>
                          <p className="text-lg font-semibold">{user.roleData.company_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Industry</label>
                          <p className="text-lg font-semibold">{user.roleData.industry || 'Not specified'}</p>
                        </div>
                      </>
                    )}
                    {user.role === 'project_manager' && user.roleData && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Department</label>
                          <p className="text-lg font-semibold">{user.roleData.department}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Level</label>
                          <p className="text-lg font-semibold">{user.roleData.manager_level}</p>
                        </div>
                      </>
                    )}
                    {user.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-lg font-semibold">{user.phone}</p>
                      </div>
                    )}
                    {user.created_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Member Since</label>
                        <p className="text-lg font-semibold">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Role-Specific Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} whileHover={{ y: -5 }}>
                <Card className="shadow-lg border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-gray-500 text-sm">
                      {stat.label === "Active Projects" && "+12% this month"}
                      {stat.label === "Active Users" && "+8% this month"}
                      {stat.label === "Pending Approvals" && "-5% this month"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Activity Section */}
        {active === "Home" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <Card className="shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">New application submitted</p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Profile updated</p>
                      <p className="text-sm text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}