"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  Settings,
  LogOut,
  Shield,
  Database,
  BarChart,
  Bell,
  FileText,
  CreditCard,
  Server,
  Key,
  Monitor,
  Activity,
  AlertTriangle,
  UserCheck,
  UserPlus,
  Cog,
  Eye,
  Lock,
  CheckCircle,
  HardDrive as HardDriveIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import your child components
import MessagingSystem from "./Messaging/page";
import AdminTeamDocumentsPage from "./team-documents/page";
import AdminDocumentsManager from "./AdminDocumentsManager/page";
import VClientPage from "../full_stack_developer/Projects_report/page";
import ProjectsHome from "./Projects/page";
import ProjectProgress from "./Projects/Project_Progress/page";

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

interface MenuItem {
  name: string;
  icon: any;
  path: string;
}

export default function AdminDashboard({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [systemHealth, setSystemHealth] = useState({
    cpu: 65,
    memory: 78,
    storage: 42,
    uptime: 99.8
  });



  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: Home, path: "dashboard" },
    { name: "Documents-upload", icon: Users, path: "documents" },
    { name: "Messaging", icon: Settings, path: "messaging" },
    { name: "Team-Documents", icon: Database, path: "team-documents" },
    { name: "Projects", icon: FileText, path: "projects" },
    { name: "Project Progress", icon: BarChart, path: "project-progress" },
  ];

  const isMenuItemActive = (itemPath: string) => {
    return activeSection === itemPath;
  };

  const handleMenuClick = (path: string) => {
    setActiveSection(path);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent systemHealth={systemHealth} />;
      case "documents":
        return <AdminDocumentsManager />;
      case "messaging":
        return <MessagingSystem />;
      case "team-documents":
        return <AdminTeamDocumentsPage />;
      case "projects":
        return <ProjectsHome />;
      case "project-progress":
        return <ProjectProgress />;
      default:
        return <DashboardContent systemHealth={systemHealth} />;
    }
  };

  useEffect(() => {
    fetchUserData();
    // Simulate system health updates
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        cpu: Math.min(100, Math.max(20, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.min(100, Math.max(30, prev.memory + (Math.random() * 8 - 4))),
        storage: Math.min(100, Math.max(10, prev.storage + (Math.random() * 2 - 1))),
        uptime: 99.8 // Static for demo
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (response.ok && data.user) {
        if (data.user.role !== 'admin') {
          // Redirect non-admin users
          window.location.href = '/role-selection';
          return;
        }
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
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Error logging out:', err);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 text-gray-900">
      {/* Fixed Sidebar */}
      <aside className={`bg-white/95 shadow-xl border-r border-gray-200 backdrop-blur-md flex flex-col fixed h-full transition-all duration-300 overflow-hidden ${
        sidebarOpen ? "w-64" : "w-0"
      }`}>
        <div className={`h-full transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <Badge className="mt-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs">
                System Administrator
              </Badge>
            </div>
          </div>
          {user.roleData && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Monitor className="h-4 w-4" />
                <span>Admin Level: {user.roleData.admin_level || 'Super Admin'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Activity className="h-4 w-4" />
                <span>Last Access: {user.roleData.last_access || 'Now'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 text-xl font-bold text-blue-700 text-center border-b border-gray-200">
          System Administration
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const isActive = isMenuItemActive(item.path);
            return (
              <motion.div
                key={item.name}
                onClick={() => handleMenuClick(item.path)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                )}
              </motion.div>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">System Status</span>
            <Badge className="bg-green-100 text-green-800">Online</Badge>
          </div>
          <Button
            onClick={handleLogout}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        </div>
      </aside>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-all duration-300 z-50"
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      {/* Main Content */}
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${
        sidebarOpen ? "ml-64" : "ml-0"
      }`}>
        {renderActiveSection()}
        
        {/* Additional children (if any) */}
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}

// Dashboard Content Component
function DashboardContent({ systemHealth }: { systemHealth: any }) {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your entire system</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <Badge className="ml-1 bg-red-500">3</Badge>
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">
            Quick Action
          </Button>
        </div>
      </div>

      {/* System Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CPU Usage</p>
                <p className="text-2xl font-bold mt-1">{systemHealth.cpu.toFixed(1)}%</p>
                <Progress value={systemHealth.cpu} className="mt-2" />
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Memory Usage</p>
                <p className="text-2xl font-bold mt-1">{systemHealth.memory.toFixed(1)}%</p>
                <Progress value={systemHealth.memory} className="mt-2" />
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage</p>
                <p className="text-2xl font-bold mt-1">{systemHealth.storage.toFixed(1)}%</p>
                <Progress value={systemHealth.storage} className="mt-2" />
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <HardDriveIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold mt-1">{systemHealth.uptime}%</p>
                <div className="mt-2 text-sm text-green-600">✓ All systems operational</div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column - User Stats */}
        <Card className="border-0 shadow-xl lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="recent">Recent Activity</TabsTrigger>
                <TabsTrigger value="roles">Role Distribution</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">1,254</p>
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">23</p>
                    <p className="text-sm text-gray-600">New Today</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-700">5</p>
                    <p className="text-sm text-gray-600">Pending Approval</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Active Users (24h)</span>
                    <span className="font-semibold">892</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Admin Users</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Suspended Users</span>
                    <Badge variant="destructive">8</Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="recent">
                <div className="space-y-3">
                  {['User registration', 'Role change', 'Password reset', 'Profile update', 'Login attempt'].map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{activity}</p>
                          <p className="text-sm text-gray-500">5 minutes ago</p>
                        </div>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right Column - Quick Actions */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Button className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
              <Button className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border border-green-200">
                <Shield className="h-4 w-4 mr-2" />
                Security Scan
              </Button>
              <Button className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200">
                <Database className="h-4 w-4 mr-2" />
                Backup Database
              </Button>
              <Button className="w-full justify-start bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200">
                <Eye className="h-4 w-4 mr-2" />
                View Logs
              </Button>
              <Button className="w-full justify-start bg-red-50 hover:bg-red-100 text-red-700 border border-red-200">
                <Lock className="h-4 w-4 mr-2" />
                Lock System
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-4">System Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version</span>
                  <span className="font-medium">v2.4.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Backup</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SSL Certificate</span>
                  <Badge className="bg-green-100 text-green-800">Valid</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Status</span>
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'System update applied', time: '10:30 AM', status: 'success' },
                { action: 'Security patch installed', time: '9:45 AM', status: 'success' },
                { action: 'Database optimization', time: '8:15 AM', status: 'warning' },
                { action: 'User bulk import', time: 'Yesterday', status: 'success' },
                { action: 'API rate limit exceeded', time: 'Yesterday', status: 'error' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : activity.status === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant={
                    activity.status === 'success' ? 'default' :
                    activity.status === 'warning' ? 'secondary' : 'destructive'
                  }>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-700">High Priority</h4>
                </div>
                <p className="text-sm text-red-600">Unusual login attempts detected from multiple IPs</p>
                <Button variant="outline" size="sm" className="mt-3 border-red-300 text-red-700 hover:bg-red-100">
                  Investigate
                </Button>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-700">Medium Priority</h4>
                </div>
                <p className="text-sm text-yellow-600">Database backup overdue by 12 hours</p>
                <Button variant="outline" size="sm" className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  Schedule Backup
                </Button>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-700">Information</h4>
                </div>
                <p className="text-sm text-blue-600">Monthly system maintenance scheduled for next week</p>
                <Button variant="outline" size="sm" className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100">
                  View Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}