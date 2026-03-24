import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dobAD: '',
    gender: '',
    email: '',
    mobile: '',
    citizenship: '',
    nid: ''
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

      case 'citizenship':
        return /^[0-9\-\/]+$/.test(value)
          ? ''
          : 'Only numbers, - or / allowed';

      case 'nid':
        return /^\d{10}$/.test(value)
          ? ''
          : 'NID must be exactly 10 digits';

      case 'dobAD':
        return value && new Date(value) > new Date()
          ? 'Future date not allowed'
          : value ? '' : 'Date of Birth (AD) is required';

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

    setFormData(prev => ({ ...prev, [name]: updatedValue }));
    setErrors(prev => ({ ...prev, [name]: validate(name, updatedValue) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final check before submit
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

    // Also check required fields
    const requiredFields = ['firstName', 'lastName', 'gender', 'email', 'mobile', 'citizenship', 'nid'];
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

  const errorSpan = (field) =>
    errors[field] && <span className="text-red-500 text-sm">{errors[field]}</span>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 my-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Registration Form
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-medium mb-2">First Name *</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your First name"
              className="w-full px-4 py-2 border rounded-lg"
            />
            {errorSpan('firstName')}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Last Name *</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your Last name"
              className="w-full px-4 py-2 border rounded-lg"
            />
            {errorSpan('lastName')}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
  <label className="block text-sm font-medium mb-2">Date of Birth (A.D.) *</label>
  <input
    type="date"
    name="dobAD"
    value={formData.dobAD}
    onChange={handleChange}
    className="w-full px-4 py-2 border rounded-lg"
  />
  {errorSpan('dobAD')}
</div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your Email"
              className="w-full px-4 py-2 border rounded-lg"
            />
            {errorSpan('email')}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mobile Number *</label>
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="07XXXXXXXXX"
              className="w-full px-4 py-2 border rounded-lg"
              maxLength={11}
            />
            {errorSpan('mobile')}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Citizenship Number *</label>
            <input
              name="citizenship"
              value={formData.citizenship}
              onChange={handleChange}
              placeholder="Enter your Citizenship details"
              className="w-full px-4 py-2 border rounded-lg"
            />
            {errorSpan('citizenship')}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">NID Number *</label>
            <input
              name="nid"
              value={formData.nid}
              onChange={handleChange}
              placeholder="Enter your NID card details"
              className="w-full px-4 py-2 border rounded-lg"
              maxLength={10}
            />
            {errorSpan('nid')}
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>

          <div className="md:col-span-2 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline"
            >
              Already have an account? Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;