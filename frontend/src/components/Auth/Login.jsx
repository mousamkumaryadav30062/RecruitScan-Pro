import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react'; // Using lucide-react icons

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrMobile: '',
    password: ''
  });

  // ✅ Added state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData.emailOrMobile, formData.password);
      toast.success('Login successful!');
      
      if (user.isFirstLogin) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Exam Roll System</h1>
          <p className="text-gray-600 mt-2">Login to your account</p>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email / Mobile Number
            </label>
            <input
              type="text"
              value={formData.emailOrMobile}
              onChange={(e) => setFormData({ ...formData, emailOrMobile: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email or mobile"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            {/* ✅ Wrapped input in relative div */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}  // ✅ dynamic type
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
                placeholder="Enter password"
              />

              {/* ✅ Eye Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Login
          </button>

          <div className="text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:underline"
            >
              New user? Register here
            </button>
            
          </div>
          <div className="text-center">
          <button
              onClick={() => navigate('/admin/login')}
              className="text-purple-600 hover:underline"
            >
              Admin Login
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
