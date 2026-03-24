import React, { useState } from 'react';
import { Menu, User, LogOut, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const [userDropdown, setUserDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>
      
      <div className="relative">
        <button
          onClick={() => setUserDropdown(!userDropdown)}
          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
        >
          <User className="w-5 h-5 text-gray-700" />
          <span className="font-medium text-gray-800">
            {user?.firstName} {user?.lastName}
          </span>
        </button>
        
        {userDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setUserDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-20 border border-gray-200">
              <button
                onClick={() => {
                  setUserDropdown(false);
                  navigate('/change-password');
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 text-gray-700 transition"
              >
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </button>
              <div className="border-t border-gray-200 my-1" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center space-x-3 text-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;