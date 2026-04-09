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
      toast.success('Additional details saved!');
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
            Application Category
          </label>
          <select
            name="quota"
            value={formData.quota}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            <option value="open">Open</option>
            <option value="women">Women</option>
            <option value="disabled">Disabled / Accessibility needs</option>
            <option value="backward">Regional Diversity</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ethnic Group
          </label>
          <select
            name="caste"
            value={formData.caste}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select ethnic group</option>
            <option value="white-scottish">White — Scottish</option>
            <option value="white-british">White — English, Welsh or Northern Irish</option>
            <option value="white-irish">White — Irish</option>
            <option value="white-other">White — Other</option>
            <option value="mixed">Mixed or multiple ethnic groups</option>
            <option value="asian-british">Asian or Asian British</option>
            <option value="black-british">Black, Black British, Caribbean or African</option>
            <option value="other-ethnic">Other ethnic group</option>
            <option value="prefer-not">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Religion or Belief
          </label>
          <select
            name="religion"
            value={formData.religion}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select religion or belief</option>
            <option value="no-religion">No religion</option>
            <option value="christianity">Christianity</option>
            <option value="islam">Islam</option>
            <option value="hinduism">Hinduism</option>
            <option value="sikhism">Sikhism</option>
            <option value="judaism">Judaism</option>
            <option value="buddhism">Buddhism</option>
            <option value="other">Other religion or belief</option>
            <option value="prefer-not">Prefer not to say</option>
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
            <option value="">Select status</option>
            <option value="employed">Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="self-employed">Self-employed</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
        <p className="text-sm text-gray-700">
          This information is collected for equal opportunities monitoring purposes only and will not be used in
          the selection process. Providing this information is voluntary.
        </p>
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
