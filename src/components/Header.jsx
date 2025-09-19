import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-1.5 sm:p-2">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Maintenance System</h1>
              <p className="text-xs sm:text-sm text-gray-600">Payment Tracking</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-gray-800">Maintenance</h1>
            </div>
          </Link>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{user?.username}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isAdmin() 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {isAdmin() ? 'Admin' : `Flat ${user?.flatNumber}`}
              </span>
            </div>

            {isAdmin() && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Admin Panel</span>
              </Link>
            )}

            {isAdmin() && (
              <Link
                to="/admin"
                className="sm:hidden p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </Link>
            )}

            <button
              onClick={logout}
              className="hidden sm:flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Logout</span>
            </button>

            <button
              onClick={logout}
              className="sm:hidden p-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;