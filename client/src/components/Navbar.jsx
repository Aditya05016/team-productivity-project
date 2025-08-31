import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) {
    return null; // Hide navbar on login/register
  }

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand - Fixed width for consistent spacing */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
                Team Productivity
              </span>
            </Link>
          </div>

          {/* Centered Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-8">
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive("/")
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/tasks"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive("/tasks")
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                Tasks
              </Link>
              <Link
                to="/analytics"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive("/analytics")
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                Analytics
              </Link>
            </div>
          </div>

          {/* User Profile + Logout - Fixed width for balance */}
          <div className="flex items-center space-x-3 min-w-0 flex-shrink-0">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-gray-700">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden sm:block min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                  {user?.name || 'Admin User'}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role || 'Admin'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex-shrink-0"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-gray-50">
        <div className="px-3 py-2 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive("/")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/tasks"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive("/tasks")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Tasks
          </Link>
          <Link
            to="/analytics"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive("/analytics")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Analytics
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-base font-medium transition-colors mt-2"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;