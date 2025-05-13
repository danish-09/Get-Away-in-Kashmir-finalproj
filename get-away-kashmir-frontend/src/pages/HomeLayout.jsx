// Import necessary dependencies for routing and icons
import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Home,
  PlusSquare,
  Users,
  MessageCircle,
  Settings,
  Menu,
  X,
} from "lucide-react";

// HomeLayout component - Main layout wrapper with responsive sidebar navigation
const HomeLayout = () => {
  // Get current location for active link highlighting
  const location = useLocation();
  // State for mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper function to check if a nav link is currently active
  const isActive = (path) => location.pathname === path;

  // Navigation configuration with paths, labels, and icons
  const navLinks = [
    { path: "/home", label: "Home", icon: <Home size={18} /> },
    { path: "/add-post", label: "Add Post", icon: <PlusSquare size={18} /> },
    { path: "/friends", label: "Friends", icon: <Users size={18} /> },
    { path: "/chat", label: "Chat", icon: <MessageCircle size={18} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  // UI Structure:
  // - Responsive layout with sidebar and main content
  // - Mobile menu toggle
  // - Animated sidebar with navigation links
  return (
    <div className="min-h-screen flex bg-gray-50 relative">
      {/* Mobile menu toggle button - visible only on small screens */}
      <button
        className="md:hidden p-4 absolute top-2 left-2 z-20"
        onClick={() => setSidebarOpen((prev) => !prev)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar navigation with gradient background */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen z-10 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out
    w-64 bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-white shadow-lg p-6`}
      >
        {/* App title */}
        <h2 className="text-2xl font-bold text-amber-200 mb-8">Get - Away</h2>
        
        {/* Navigation links */}
        <nav className="space-y-4">
          {navLinks.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 ${
                isActive(path)
                  ? "text-amber-100 font-semibold"
                  : "text-gray-300 hover:text-amber-200"
              }`}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content area - renders child routes */}
      <main className="flex-1 bg-gray-200 p-4 md:p-6 md:ml-0">
        <Outlet />
      </main>
    </div>
  );
};

export default HomeLayout;
