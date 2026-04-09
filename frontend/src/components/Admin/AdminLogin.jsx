import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/admin/login', formData);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">


      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-300 w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin sign in</h1>
          <p className="text-gray-600 text-sm mb-6 border-b border-gray-200 pb-4">
            Access the RecruitScan Pro administration dashboard
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none"
                placeholder="Enter admin email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none pr-12"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 font-bold text-base hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-blue-700 hover:underline text-sm font-medium"
              >
                Go to applicant login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
