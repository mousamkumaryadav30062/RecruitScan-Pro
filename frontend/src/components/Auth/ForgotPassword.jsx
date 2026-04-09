import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message || 'A new password has been sent to your email!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-300 w-full max-w-md p-8">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center text-blue-700 hover:underline text-sm font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to sign in
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h1>
          <p className="text-gray-600 text-sm mb-6 border-b border-gray-200 pb-4">
            Enter your registered email address and we will send you a new temporary password.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none"
                placeholder="Enter your registered email"
                required
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 font-bold text-base hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send new password'}
            </button>

            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-blue-700 hover:underline text-sm font-medium"
              >
                Remember your password? Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
