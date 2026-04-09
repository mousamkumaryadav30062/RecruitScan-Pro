import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dobAD: '',
    gender: '',
    email: '',
    mobile: '',
    niNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return /^[A-Za-z\s]+$/.test(value) ? '' : 'Only alphabets allowed';

      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ''
          : 'Invalid email format';

      case 'mobile':
        return /^07\d{9}$/.test(value)
          ? ''
          : 'Mobile must be 11 digits and start with 07';

      case 'niNumber':
  return /^[A-Z]{2}[0-9]{6}[A-Z]$/i.test(value.replace(/\s/g, ''))
    ? ''
    : 'NI Number must be in format: AB123456C';

      case 'dobAD':
        return value && new Date(value) > new Date()
          ? 'Future date not allowed'
          : value ? '' : 'Date of Birth is required';

      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === 'firstName' || name === 'lastName') {
      updatedValue = value.toUpperCase();
    }

    if (name === 'email') {
      updatedValue = value.toLowerCase();
    }

    if (name === 'niNumber') {
      updatedValue = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: updatedValue }));
    setErrors(prev => ({ ...prev, [name]: validate(name, updatedValue) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    Object.keys(formData).forEach(field => {
      const err = validate(field, formData[field]);
      if (err) validationErrors[field] = err;
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix validation errors');
      return;
    }

    const requiredFields = ['firstName', 'lastName', 'gender', 'email', 'mobile', 'niNumber', 'dobAD'];
    const missing = requiredFields.find(f => !formData[f]?.trim());
    if (missing) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      toast.success(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { given_name, family_name, email } = decoded;
      setFormData(prev => ({
        ...prev,
        firstName: (given_name || '').toUpperCase(),
        lastName: (family_name || '').toUpperCase(),
        email: email || ''
      }));
      toast.success('Google details pre-filled. Please complete the remaining fields.');
    } catch {
      toast.error('Google sign-in failed. Please fill in manually.');
    }
  };

  const errorSpan = (field) =>
    errors[field] && <span className="text-red-500 text-sm mt-1 block">{errors[field]}</span>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 overflow-y-auto">
      

      <div className="max-w-3xl mx-auto bg-white border border-gray-300 p-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Create a new account
        </h1>
        <p className="text-gray-600 text-sm mb-6 border-b border-gray-200 pb-4">
          Register to apply for Scottish Civil Service examinations and vacancies. All fields marked with * are required.
        </p>

        {/* Google Sign-in */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Sign in with Google to pre-fill your details:</p>
          <div className="flex justify-start">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-in failed')}
              text="continue_with"
              shape="rectangular"
              theme="outline"
            />
          </div>
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-sm text-gray-500">or complete the form below</span>
            <hr className="flex-grow border-gray-300" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">First Name *</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none"
            />
            {errorSpan('firstName')}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Last Name *</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none"
            />
            {errorSpan('lastName')}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none bg-white"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Prefer not to say / Other</option>
            </select>
            {errorSpan('gender')}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Date of Birth *</label>
            <input
              type="date"
              name="dobAD"
              value={formData.dobAD}
              onChange={handleChange}
              className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none"
            />
            {errorSpan('dobAD')}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Email Address *</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none"
            />
            {errorSpan('email')}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">UK Mobile Number *</label>
            <p className="text-xs text-gray-500 mb-1">Format: 07XXXXXXXXX</p>
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="07XXXXXXXXX"
              className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none"
              maxLength={11}
            />
            {errorSpan('mobile')}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-900 mb-1">National Insurance Number *</label>
            <p className="text-xs text-gray-500 mb-1">Format: AB123456C — do not include spaces</p>
            <input
              name="niNumber"
              value={formData.niNumber}
              onChange={(e) => {
                const cleanedValue = e.target.value
                  .toUpperCase()
                  .replace(/\s/g, '')
                  .replace(/[^A-Z0-9]/g, '')
                  .slice(0, 9);

                setFormData(prev => ({ ...prev, niNumber: cleanedValue }));
                setErrors(prev => ({ ...prev, niNumber: validate('niNumber', cleanedValue) }));
              }}
              placeholder="e.g. AB123456C"
              className="w-full px-3 py-2 border-2 border-gray-400 focus:border-blue-600 focus:outline-none"
              maxLength={9}
            />
            {errorSpan('niNumber')}
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 font-bold text-base hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Create account'}
            </button>
          </div>

          <div className="md:col-span-2 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-700 hover:underline text-sm font-medium"
            >
              Already have an account? Sign in
            </button>
          </div>

        </div>

        <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-600">
          <p className="text-xs text-gray-700">
            <strong>Privacy Notice:</strong> This information is collected under the authority of the Civil Service Act 1978.
            Your data will be processed in accordance with the UK GDPR and the Data Protection Act 2018 for the purpose of
            managing civil service recruitment. For more information, see our <span className="text-blue-700 underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
