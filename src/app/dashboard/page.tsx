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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  const menuItems = [
    { name: "Home", icon: Home },
    { name: "Applications", icon: FileText },
    { name: "Users", icon: Users },
    { name: "Settings", icon: Settings },
  ];

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();

      if (response.ok && data.client) {
        setClient(data.client);
      } else {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const handleSignout = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });

      if (response.ok) {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  const navigateToVClient = () => {
    window.location.href = "/vclient";
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

  if (!client) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-green-100 via-gray-100 to-green-200 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Not authenticated</p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="mt-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 via-gray-100 to-green-200 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 shadow-xl border-r border-gray-200 backdrop-blur-md flex flex-col">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {client.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {client.name}
              </p>
              <p className="text-sm text-gray-500 truncate">{client.email}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Building className="h-4 w-4" />
              <span className="truncate">{client.company}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{client.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 text-xl font-bold text-green-700 text-center border-b border-gray-200">
          My Dashboard
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
              Welcome back, {client.name}! Here's what's happening today.
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
                  <User className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Full Name
                      </label>
                      <p className="text-lg font-semibold">{client.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-lg font-semibold">{client.email}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Company
                      </label>
                      <p className="text-lg font-semibold">{client.company}</p>
                    </div>
                    {client.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Phone
                        </label>
                        <p className="text-lg font-semibold">{client.phone}</p>
                      </div>
                    )}
                    {client.created_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Member Since
                        </label>
                        <p className="text-lg font-semibold">
                          {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -5 }}>
            <Card className="shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle>Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">1,245</p>
                <p className="text-gray-500 text-sm">+12% this month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -5 }}>
            <Card className="shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">3,498</p>
                <p className="text-gray-500 text-sm">+8% this month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -5 }}>
            <Card className="shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">76</p>
                <p className="text-gray-500 text-sm">-5% this month</p>
              </CardContent>
            </Card>
          </motion.div>
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
                      <p className="font-semibold">
                        New application submitted
                      </p>
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
