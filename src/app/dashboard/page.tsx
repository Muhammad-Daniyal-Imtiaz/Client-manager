"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  FileText,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [active, setActive] = useState("Home");

  const menuItems = [
    { name: "Home", icon: Home },
    { name: "Applications", icon: FileText },
    { name: "Users", icon: Users },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 via-gray-100 to-green-200 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 shadow-xl border-r border-gray-200 backdrop-blur-md flex flex-col">
        <div className="p-6 text-2xl font-bold text-green-700">My Dashboard</div>
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
        <div className="p-6 border-t border-gray-200">
          <Button variant="outline" className="w-full flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">{active}</h1>
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

        {/* Cards Section */}
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
      </main>
    </div>
  );
}
