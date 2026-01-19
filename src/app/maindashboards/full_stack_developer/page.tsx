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
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Import your child components
import MessagingSystem from "./Messaging/page";
import VClientPage from "./Projects_report/page";
import AdminTeamDocumentsPage from "./team-documents/page";

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
  roleData?: {
    team_size?: number;
    success_rate?: number;
    department?: string;
    manager_level?: string;
    years_experience?: number;
    [key: string]: unknown;
  };
}

interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

export default function ProjectManagerDashboard({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: Home, path: "dashboard" },
    { name: "Projects Progress", icon: FileText, path: "projects" },
    { name: "Team Documents", icon: Users, path: "team-documents" },
    { name: "Calendar", icon: Calendar, path: "calendar" },
    { name: "Tasks", icon: CheckCircle, path: "tasks" },
    { name: "Reports", icon: BarChart3, path: "reports" },
    { name: "Messaging", icon: Bell, path: "messaging" },
    { name: "Settings", icon: Settings, path: "settings" },
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
        return <DashboardContent user={user} />;
      case "projects":
        return <VClientPage />;
      case "team-documents":
        return <AdminTeamDocumentsPage />;
      case "messaging":
        return <MessagingSystem />;
      case "calendar":
        return <CalendarContent />;
      case "tasks":
        return <TasksContent />;
      case "reports":
        return <ReportsContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return <DashboardContent user={user} />;
    }
  };

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
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-gray-100 to-pink-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          {/* <p className="mt-4 text-gray-600">Loading Project Manager Dashboard...</p> */}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-gray-100 to-pink-100 text-gray-900">
      {/* Fixed Sidebar with toggle */}
      <aside className={`bg-white/90 shadow-xl border-r border-gray-200 backdrop-blur-md flex flex-col fixed h-full transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"
        }`}>
        {/* Sidebar Toggle Button at Top */}
        <div className="p-4 border-b border-gray-200 flex justify-end">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                <Badge className="mt-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs">
                  {/* Project Manager */}
                </Badge>
              </div>
            )}
          </div>
          {sidebarOpen && user.roleData && (
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

        {sidebarOpen && (
          <div className="p-4 text-xl font-bold text-purple-700 text-center border-b border-gray-200">
            {/* Project Manager */}
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const isActive = isMenuItemActive(item.path);
            return (
              <motion.div
                key={item.name}
                onClick={() => handleMenuClick(item.path)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all duration-200 ${isActive
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                  : "text-gray-700 hover:bg-purple-50"
                  }`}
              >
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                )}
              </motion.div>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          {sidebarOpen ? (
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="icon"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"
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
function DashboardContent({ user }: { user: UserData | null }) {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your projects and team efficiently</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <Badge className="ml-1 bg-red-500">3</Badge>
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
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
                    <p className="text-lg font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="text-lg font-medium">{user?.email}</p>
                  </div>
                  {user?.phone && (
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
                {user?.roleData && (
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Quick Project Start</p>
                <p className="text-sm text-gray-600 mt-1">Create a new project in minutes</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              Start New Project
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Team Management</p>
                <p className="text-sm text-gray-600 mt-1">Assign tasks to your team</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Manage Team
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Reports & Analytics</p>
                <p className="text-sm text-gray-600 mt-1">View project performance</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Other Content Components
function CalendarContent() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-2">Schedule and manage your events</p>
      </div>
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white rounded-t-lg">
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600">Calendar functionality will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function TasksContent() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600 mt-2">Manage your tasks and to-dos</p>
      </div>
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600">Task management functionality will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsContent() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">View and analyze project reports</p>
      </div>
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-t-lg">
          <CardTitle>Project Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600">Report generation and analytics will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsContent() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your account and preferences</p>
      </div>
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600">Settings management will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}