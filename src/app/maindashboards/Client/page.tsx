"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  ShoppingBag,
  CreditCard,
  Package,
  MessageSquare,
  Bell,
  HelpCircle,
  User,
  Settings,
  LogOut,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  Star,
  FileText,
  Calendar,
  Target,
  RefreshCw,
  Download,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import your child components
import MessagingSystem from "./Messaging/page";
import VClientPage from "./vclient/page";
import DocumentManager from "./DocumentManager/page";

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

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'pending';
  progress: number;
  deadline: string;
  teamSize: number;
  budget: number;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  project: string;
}

export default function ClientDashboard({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [activeProjects, setActiveProjects] = useState<Project[]>([
    { id: '1', name: 'Website Redesign', status: 'active', progress: 65, deadline: '2024-12-15', teamSize: 4, budget: 15000 },
    { id: '2', name: 'Mobile App', status: 'active', progress: 85, deadline: '2024-11-30', teamSize: 6, budget: 25000 },
    { id: '3', name: 'E-commerce Platform', status: 'pending', progress: 15, deadline: '2025-01-20', teamSize: 5, budget: 30000 },
  ]);
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-001', date: '2024-10-15', amount: 5000, status: 'paid', project: 'Website Redesign' },
    { id: 'INV-002', date: '2024-10-20', amount: 7500, status: 'pending', project: 'Mobile App' },
    { id: 'INV-003', date: '2024-10-01', amount: 3000, status: 'overdue', project: 'SEO Optimization' },
  ]);

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: Home, path: "dashboard" },
    { name: "Documents", icon: FileText, path: "documents" },
    { name: "My Projects Progress", icon: ShoppingBag, path: "projects" },
    { name: "Messages", icon: MessageSquare, path: "messages" },
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
        return <DashboardContent user={user} activeProjects={activeProjects} invoices={invoices} />;
      case "documents":
        return <DocumentManager />;
      case "projects":
        return <VClientPage />;
      case "messages":
        return <MessagingSystem />;
      default:
        return <DashboardContent user={user} activeProjects={activeProjects} invoices={invoices} />;
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
        if (data.user.role !== 'client') {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Client Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 text-gray-900">
      {/* Fixed Sidebar */}
      <aside className={`bg-white/95 shadow-xl border-r border-gray-200 backdrop-blur-md flex flex-col fixed h-full transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
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
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-600 text-white">
                {user.name?.charAt(0).toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                <Badge className="mt-1 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-xs">
                  Valued Client
                </Badge>
              </div>
            )}
          </div>
          {sidebarOpen && user.roleData && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <ShoppingBag className="h-4 w-4" />
                <span>Active Projects: {user.roleData.active_projects || 3}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Star className="h-4 w-4" />
                <span>Client Since: {user.roleData.client_since || '2024'}</span>
              </div>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div className="p-4 text-xl font-bold text-emerald-700 text-center border-b border-gray-200">
            Client Portal
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
                className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-600 text-white"
                    : "text-gray-700 hover:bg-emerald-50"
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

        <div className="border-t border-gray-200 p-4 space-y-3">
          {sidebarOpen ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Account Balance</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(user.roleData?.account_balance || 5000)}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-600 text-white">
                  {user.name?.charAt(0).toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <Button
                onClick={handleLogout}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                size="icon"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${
        sidebarOpen ? "ml-64" : "ml-20"
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
function DashboardContent({ 
  user, 
  activeProjects, 
  invoices 
}: { 
  user: UserData | null; 
  activeProjects: Project[]; 
  invoices: Invoice[]; 
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your projects today</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <Badge className="ml-1 bg-red-500">2</Badge>
          </Button>
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700">
            <ShoppingBag className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold mt-1">{activeProjects.filter(p => p.status === 'active').length}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-600">+2 this month</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Investment</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(activeProjects.reduce((sum, p) => sum + p.budget, 0))}
                </p>
                <div className="text-sm text-gray-500 mt-2">Across all projects</div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-2xl font-bold mt-1">
                  {activeProjects.reduce((sum, p) => sum + p.teamSize, 0)}
                </p>
                <div className="text-sm text-gray-500 mt-2">Working for you</div>
              </div>
              <div className="p-3 bg-cyan-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction Score</p>
                <p className="text-2xl font-bold mt-1">4.8/5</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Active Projects */}
        <Card className="border-0 shadow-xl lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-cyan-700 text-white rounded-t-lg">
            <CardTitle>Active Projects</CardTitle>
            <CardDescription className="text-emerald-100">Track your current projects</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {activeProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-600">{project.teamSize} team members</span>
                        <span className="text-sm text-gray-600">Budget: {formatCurrency(project.budget)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {project.deadline}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Edit className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t border-gray-200">
            <Button variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              View All Projects
            </Button>
          </CardFooter>
        </Card>

        {/* Right Column - Quick Actions & Invoices */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Request New Project
                </Button>
                <Button className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button className="w-full justify-start bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200">
                  <FileText className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
                <Button className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200">
                  <Download className="h-4 w-4 mr-2" />
                  Download Documents
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white rounded-t-lg">
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription className="text-blue-100">Your latest billing information</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-gray-600">{invoice.project}</p>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div>
                        <p className="text-lg font-semibold">{formatCurrency(invoice.amount)}</p>
                        <p className="text-sm text-gray-500">Due: {invoice.date}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-200">
              <Button variant="outline" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                View All Invoices
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Recent Activity & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Project milestone completed', time: '2 hours ago', project: 'Mobile App' },
                { action: 'New message from project manager', time: '4 hours ago', project: 'Website Redesign' },
                { action: 'Invoice payment received', time: '1 day ago', project: 'SEO Optimization' },
                { action: 'Project requirements updated', time: '2 days ago', project: 'E-commerce Platform' },
                { action: 'New team member assigned', time: '3 days ago', project: 'Mobile App' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">{activity.time}</span>
                      <Badge variant="outline" className="text-xs">{activity.project}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Status */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Support & Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-700">Need Help?</h4>
                </div>
                <p className="text-sm text-blue-600 mb-3">
                  Our support team is available 24/7 to assist you with any questions or issues.
                </p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Contact Support
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Project Documentation</span>
                  </div>
                  <Download className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Video className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Training Videos</span>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">FAQ & Guides</span>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Helper Components
function Video(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}