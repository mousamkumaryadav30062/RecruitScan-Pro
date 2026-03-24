import React from 'react';
import { X, Home, User, Calendar, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'My Profile', icon: User, path: '/profile' },
    { name: 'Vacancy', icon: Calendar, path: '/vacancy' },
    { name: 'My Application', icon: FileText, path: '/my-applications' }
  ];

  const handleNavigate = (path) => {
    navigate(path); // sidebar stays open
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-72 bg-white shadow-2xl transition-transform duration-300 z-50`}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-600 font-medium">Master ID</p>
            <p className="font-bold text-xl text-blue-600">{user?.masterId}</p>
          </div>
          <button
            onClick={onClose} // Only manual close
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
          
          </button>
        </div>

        {/* Menu */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.path)} // no onClose here
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500 text-center">
            <p className="font-medium text-gray-700">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs mt-1">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
