import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';

const ExtraDetails = ({ onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    quota: '',
    caste: '',
    religion: '',
    employmentStatus: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/user/profile');
      setFormData({
        quota: data.quota || '',
        caste: data.caste || '',
        religion: data.religion || '',
        employmentStatus: data.employmentStatus || ''
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put('/user/profile/extra', formData);
      toast.success('Extra details saved!');
      onNext();
    } catch (error) {
      toast.error('Failed to save details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quota
          </label>
          <select
            name="quota"
            value={formData.quota}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Quota</option>
            <option value="open">Open</option>
            <option value="women">Women</option>
            <option value="disabled">Disabled</option>
            <option value="backward">Backward Region</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caste
          </label>
          <input
            type="text"
            name="caste"
            value={formData.caste}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Religion
          </label>
          <select
            name="religion"
            value={formData.religion}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Religion</option>
            <option value="hinduism">Hinduism</option>
            <option value="buddhism">Buddhism</option>
            <option value="islam">Islam</option>
            <option value="christianity">Christianity</option>
            <option value="kirat">Kirat</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Status
          </label>
          <select
            name="employmentStatus"
            value={formData.employmentStatus}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Status</option>
            <option value="employed">Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="self-employed">Self-employed</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
        >
          Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save & Next'}
        </button>
      </div>
    </div>
  );
};

export default ExtraDetails;