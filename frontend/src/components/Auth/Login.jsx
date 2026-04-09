import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../utils/api';

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrMobile: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, setAuthData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData.emailOrMobile, formData.password);
      toast.success('Sign-in successful!');

      if (user.isFirstLogin) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sign-in failed');
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const { data } = await api.post('/auth/google-login', {
        credential: credentialResponse.credential
      });
      if (setAuthData) {
        setAuthData(data.token, data.user);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      toast.success('Signed in with Google!');
      if (data.user.isFirstLogin) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google sign-in failed. Please use email and password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
     

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-300 w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-600 text-sm mb-6 border-b border-gray-200 pb-4">
            Sign in to your RecruitScan Pro account
          </p>

          {/* Google Sign-in */}
          <div className="mb-5">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error('Google sign-in failed')}
              text="signin_with"
              shape="rectangular"
              theme="outline"
              width="100%"
            />
          </div>
          <div className="flex items-center mb-5">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-sm text-gray-500">or sign in with email</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Email address or mobile number
              </label>
              <input
                type="text"
                value={formData.emailOrMobile}
                onChange={(e) => setFormData({ ...formData, emailOrMobile: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none"
                placeholder="Enter email or mobile"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none pr-12"
                  placeholder="Enter password"
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

            <div className="flex justify-end">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-blue-700 hover:underline font-medium"
              >
                Forgot your password?
              </button>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-green-700 text-white py-3 font-bold text-base hover:bg-green-800 transition"
            >
              Sign in
            </button>

            <div className="text-center space-y-2">
              <div>
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-700 hover:underline text-sm font-medium"
                >
                  New user? Create an account
                </button>
              </div>
              <div>
                <button
                  onClick={() => navigate('/admin/login')}
                  className="text-gray-600 hover:underline text-sm"
                >
                  Admin access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
