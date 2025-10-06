"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
  Mail,
  Building,
  Phone,
  Calendar,
  Shield,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Plus,
  ArrowRight,
  Menu,
  X,
  Zap,
  BarChart3,
  Download,
  Upload,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Globe,
  Smartphone,
  Database,
  Cpu,
  Wallet,
  Gift,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Share2,
  Eye,
  Filter,
  SortAsc,
  MoreHorizontal,
  Heart,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Send,
  Camera,
  Video,
  Mic,
  Image,
  File,
  Folder,
  FolderOpen,
  Save,
  Printer,
  Link,
  Lock,
  Unlock,
  Key,
  EyeOff,
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Moon,
  Wifi,
  Bluetooth,
  Battery,
  BatteryCharging,
  Power,
  RefreshCw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Ban,
  Radio,
  Tv,
  Speaker,
  Headphones,
  Mic2,
  VideoOff,
  PhoneOff,
  PhoneForwarded,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Server,
  HardDrive,
  Monitor,
  Mouse,
  Keyboard,
  Router,
  WifiOff,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default function Dashboard() {
  const [active, setActive] = useState("Home");
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const menuItems = [
    { name: "Home", icon: Home, badge: null },
    { name: "Applications", icon: FileText, badge: 12 },
    { name: "Clients", icon: Users, badge: 3 },
    { name: "Analytics", icon: BarChart3, badge: null },
    { name: "Settings", icon: Settings, badge: null },
  ];

  const quickActions = [
    { name: "Add Client", icon: Plus, path: "/vclient", color: "bg-blue-500" },
    { name: "View Reports", icon: PieChart, path: "/reports", color: "bg-green-500" },
    { name: "Support", icon: MessageSquare, path: "/support", color: "bg-purple-500" },
    { name: "Downloads", icon: Download, path: "/downloads", color: "bg-orange-500" },
  ];

  const stats = [
    { label: "Total Clients", value: "142", change: "+12%", icon: Users, color: "text-green-600", bgColor: "bg-green-100" },
    { label: "Active Projects", value: "24", change: "+3 this week", icon: Target, color: "text-blue-600", bgColor: "bg-blue-100" },
    { label: "Revenue", value: "$12.4K", change: "+8.2% growth", icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-100" },
    { label: "Pending Tasks", value: "7", change: "-2 from yesterday", icon: Clock, color: "text-orange-600", bgColor: "bg-orange-100" },
  ];

  const recentActivities = [
    { action: "New client onboarded", time: "2 hours ago", icon: User, color: "text-green-600" },
    { action: "Project milestone completed", time: "5 hours ago", icon: CheckCircle, color: "text-blue-600" },
    { action: "Payment received", time: "1 day ago", icon: CreditCard, color: "text-purple-600" },
    { action: "Support ticket resolved", time: "2 days ago", icon: ShieldCheck, color: "text-orange-600" },
  ];

  const systemStatus = [
    { service: "API Server", status: "online", icon: Server, color: "text-green-600" },
    { service: "Database", status: "online", icon: Database, color: "text-green-600" },
    { service: "File Storage", status: "online", icon: HardDrive, color: "text-green-600" },
    { service: "CDN", status: "degraded", icon: Globe, color: "text-orange-600" },
  ];

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (response.ok && data.client) {
        setClient(data.client);
      } else {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      window.location.href = '/login';
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

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white shadow-xl border-r border-slate-200 backdrop-blur-md flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                ClientFlow Pro
              </h1>
              <p className="text-xs text-slate-500">Enterprise Suite</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 mx-4 mt-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {client.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate text-sm">{client.name}</p>
              <p className="text-xs text-slate-600 truncate">{client.email}</p>
              <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700 text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Pro Plan
              </Badge>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Building className="h-3.5 w-3.5" />
              <span className="truncate font-medium">{client.company}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3.5 w-3.5" />
                <span className="font-medium">{client.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={item.name}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active === item.name
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
                onClick={() => {
                  setActive(item.name);
                  setSidebarOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${active === item.name ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge && (
                  <Badge className={`${active === item.name ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'} text-xs`}>
                    {item.badge}
                  </Badge>
                )}
              </motion.button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 px-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <motion.button
                  key={action.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo(action.path)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className={`h-8 w-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900 flex-1 text-left">
                    {action.name}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                </motion.button>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50/50">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-3 py-3 rounded-xl border-slate-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            onClick={handleSignout}
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{active}</h1>
                <p className="text-slate-600 text-sm mt-1">
                  Welcome back, {client.name}! Here's what's happening today.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search clients, reports..."
                  className="pl-10 pr-4 py-2.5 w-80 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              </div>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative rounded-xl"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
                
                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50"
                    >
                      <div className="p-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-900">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {[
                          { message: "New client registration", time: "2 min ago", icon: User, unread: true },
                          { message: "Payment received", time: "1 hour ago", icon: CreditCard, unread: true },
                          { message: "System update available", time: "3 hours ago", icon: Download, unread: false },
                        ].map((notification, index) => (
                          <div key={index} className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${notification.unread ? 'bg-blue-50' : ''}`}>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <notification.icon className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">{notification.message}</p>
                                <p className="text-xs text-slate-500">{notification.time}</p>
                              </div>
                              {notification.unread && (
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* VClient Button - Prominent CTA */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => navigateTo('/vclient')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Manage Clients
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                        <p className="text-xs text-green-600 font-medium mt-1">{stat.change}</p>
                      </div>
                      <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <User className="h-5 w-5 text-blue-600" />
                    Your Profile Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                          <User className="h-3 w-3 inline mr-1" />
                          Full Name
                        </label>
                        <p className="text-lg font-semibold text-slate-900">{client.name}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                          <Mail className="h-3 w-3 inline mr-1" />
                          Email Address
                        </label>
                        <p className="text-lg font-semibold text-slate-900 break-all">{client.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                          <Building className="h-3 w-3 inline mr-1" />
                          Company
                        </label>
                        <p className="text-lg font-semibold text-slate-900">{client.company}</p>
                      </div>
                      {client.phone && (
                        <div className="bg-slate-50 rounded-xl p-4">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                            <Phone className="h-3 w-3 inline mr-1" />
                            Phone
                          </label>
                          <p className="text-lg font-semibold text-slate-900">{client.phone}</p>
                        </div>
                      )}
                      {client.created_at && (
                        <div className="bg-slate-50 rounded-xl p-4">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Member Since
                          </label>
                          <p className="text-lg font-semibold text-slate-900">
                            {new Date(client.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200"
                      >
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          <activity.icon className={`h-5 w-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{activity.action}</p>
                          <p className="text-sm text-slate-500">{activity.time}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-200">
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Zap className="h-5 w-5 text-blue-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigateTo('/vclient')}
                        className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-200 group"
                      >
                        <Users className="h-5 w-5" />
                        <span className="font-semibold flex-1 text-left">Manage Clients</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigateTo('/reports')}
                        className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all duration-200 group"
                      >
                        <BarChart3 className="h-5 w-5 text-slate-600" />
                        <span className="font-medium text-slate-700 flex-1 text-left">View Reports</span>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignout}
                        className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-red-300 rounded-xl transition-all duration-200 group"
                      >
                        <LogOut className="h-5 w-5 text-slate-600" />
                        <span className="font-medium text-slate-700 flex-1 text-left">Sign Out</span>
                      </motion.button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* System Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-200">
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Server className="h-5 w-5 text-green-600" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {systemStatus.map((service, index) => (
                        <div key={service.service} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <service.icon className="h-4 w-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">{service.service}</span>
                          </div>
                          <Badge 
                            variant={service.status === 'online' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              service.status === 'online' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {service.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Additional Lucide Icons
const Crown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8.5V2.5M12 8.5l7-4.5M12 8.5L5 4M12 8.5v7.5m7-4.5v7.5a2 2 0 01-2 2H7a2 2 0 01-2-2v-7.5" />
  </svg>
);

const Activity = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
