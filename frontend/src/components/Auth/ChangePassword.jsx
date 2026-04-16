import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = ({
  name,
  label,
  placeholder,
  value,
  show,
  onChange,
  onToggle,
  passwordsMatch
}) => (
  <div>
    <label className="block text-sm font-bold text-gray-900 mb-1">{label}</label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none pr-12"
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        onClick={() => onToggle(name)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>

    {name === 'confirmPassword' && passwordsMatch && (
      <span className="text-red-500 text-sm mt-1 block">Passwords do not match</span>
    )}
  </div>
);

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      toast.success('Password changed successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    formData.newPassword &&
    formData.confirmPassword &&
    formData.newPassword !== formData.confirmPassword;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-300 w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Change password</h1>
          <p className="text-gray-600 text-sm mb-6 border-b border-gray-200 pb-4">
            Please set a new password to continue using RecruitScan Pro
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField
              name="oldPassword"
              label="Current password"
              placeholder="Enter your current password"
              value={formData.oldPassword}
              show={showPassword.oldPassword}
              onChange={handleChange}
              onToggle={toggleShowPassword}
            />

            <PasswordField
              name="newPassword"
              label="New password"
              placeholder="Enter new password (min. 6 characters)"
              value={formData.newPassword}
              show={showPassword.newPassword}
              onChange={handleChange}
              onToggle={toggleShowPassword}
            />

            <PasswordField
              name="confirmPassword"
              label="Confirm new password"
              placeholder="Re-enter new password"
              value={formData.confirmPassword}
              show={showPassword.confirmPassword}
              onChange={handleChange}
              onToggle={toggleShowPassword}
              passwordsMatch={passwordsMatch}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 font-bold text-base hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;