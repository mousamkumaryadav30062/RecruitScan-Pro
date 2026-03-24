import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { provinces, districtsByProvince } from '../../../utils/nepalData';


const AddressDetails = ({ onNext, onPrevious }) => {
  const [sameAddress, setSameAddress] = useState(false);
  const [formData, setFormData] = useState({
    permanentAddress: {
      province: '',
      district: '',
      localBody: '',
      wardNo: '',
      tole: ''
    },
    temporaryAddress: {
      province: '',
      district: '',
      localBody: '',
      wardNo: '',
      tole: ''
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/user/profile');
      if (data.permanentAddress) {
        setFormData({
          permanentAddress: data.permanentAddress,
          temporaryAddress: data.temporaryAddress || {
            province: '',
            district: '',
            localBody: '',
            wardNo: '',
            tole: ''
          }
        });
        setSameAddress(data.sameAddress || false);
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const handleChange = (addressType, field, value) => {
    setFormData({
      ...formData,
      [addressType]: {
        ...formData[addressType],
        [field]: value
      }
    });

    if (addressType === 'permanentAddress' && sameAddress) {
      setFormData(prev => ({
        ...prev,
        temporaryAddress: {
          ...prev.permanentAddress,
          [field]: value
        }
      }));
    }
  };

  const handleSameAddressToggle = () => {
    const newValue = !sameAddress;
    setSameAddress(newValue);
    
    if (newValue) {
      setFormData({
        ...formData,
        temporaryAddress: { ...formData.permanentAddress }
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put('/user/profile/address', {
        permanentAddress: formData.permanentAddress,
        temporaryAddress: formData.temporaryAddress,
        sameAddress
      });
      toast.success('Address details saved!');
      onNext();
    } catch (error) {
      toast.error('Failed to save details');
    } finally {
      setLoading(false);
    }
  };

  const renderAddressFields = (addressType, title) => {
    const address = formData[addressType];
    const selectedProvince = provinces.find(p => p.id.toString() === address.province);
    const districts = selectedProvince ? districtsByProvince[selectedProvince.id] : [];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Part *
            </label>
            <select
              value={address.province}
              onChange={(e) => handleChange(addressType, 'province', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={addressType === 'temporaryAddress' && sameAddress}
            >
              <option value="">Select Part</option>
              {provinces.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Division *
            </label>
            <select
              value={address.district}
              onChange={(e) => handleChange(addressType, 'district', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={addressType === 'temporaryAddress' && sameAddress}
            >
              <option value="">Select Division</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local Body *
            </label>
            <input
              type="text"
              value={address.localBody}
              onChange={(e) => handleChange(addressType, 'localBody', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={addressType === 'temporaryAddress' && sameAddress}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ward No. *
            </label>
            <input
              type="text"
              value={address.wardNo}
              onChange={(e) => handleChange(addressType, 'wardNo', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={addressType === 'temporaryAddress' && sameAddress}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street *
            </label>
            <input
              type="text"
              value={address.tole}
              onChange={(e) => handleChange(addressType, 'tole', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={addressType === 'temporaryAddress' && sameAddress}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderAddressFields('permanentAddress', 'Permanent Address')}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="sameAddress"
          checked={sameAddress}
          onChange={handleSameAddressToggle}
          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="sameAddress" className="text-sm font-medium text-gray-700">
          Temporary address is same as permanent address
        </label>
      </div>

      {renderAddressFields('temporaryAddress', 'Temporary Address')}

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

export default AddressDetails;