import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { Upload } from 'lucide-react';

const PersonalDetails = ({ onNext }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    dobAD: '',
    nid: '',
    citizenship: '',
    fatherName: '',
    motherName: '',
    grandFatherName: '',
    citizenshipIssuePlace: '',
    citizenshipIssueDateAD: '',
    citizenshipIssueDateBS: ''
  });
  const [files, setFiles] = useState({
    photo: null,
    signature: null,
    citizenshipFront: null,
    citizenshipBack: null
  });
  const [previews, setPreviews] = useState({
    photo: '',
    signature: '',
    citizenshipFront: '',
    citizenshipBack: ''
  });
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL.replace('/api', '');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/user/profile');
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        mobile: data.mobile || '',
        gender: data.gender || '',
        dobAD: data.dobAD ? data.dobAD.split('T')[0] : '',
        nid: data.nid || '',
        citizenship: data.citizenship || '',
        fatherName: data.fatherName || '',
        motherName: data.motherName || '',
        grandFatherName: data.grandFatherName || '',
        citizenshipIssuePlace: data.citizenshipIssuePlace || '',
        citizenshipIssueDateAD: data.citizenshipIssueDateAD ? data.citizenshipIssueDateAD.split('T')[0] : '',
        citizenshipIssueDateBS: data.citizenshipIssueDateBS || ''
      });
      
      // Set existing file previews
      if (data.photo) setPreviews(prev => ({ ...prev, photo: `${API_URL}/uploads/${data.photo}` }));
      if (data.signature) setPreviews(prev => ({ ...prev, signature: `${API_URL}/uploads/${data.signature}` }));
      if (data.citizenshipFront) setPreviews(prev => ({ ...prev, citizenshipFront: `${API_URL}/uploads/${data.citizenshipFront}` }));
      if (data.citizenshipBack) setPreviews(prev => ({ ...prev, citizenshipBack: `${API_URL}/uploads/${data.citizenshipBack}` }));
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

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setFiles(prev => ({ ...prev, [fieldName]: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
  // Required file fields with proper labels
  const fileLabels = {
    photo: 'PP Size Photo',
    signature: 'Signature',
    citizenshipFront: 'Citizenship Front',
    citizenshipBack: 'Citizenship Back'
  };

  for (let field in fileLabels) {
    if (!files[field] && !previews[field]) {
      toast.error(`${fileLabels[field]} is required`);
      return;
    }
  }
    setLoading(true);
    try {
      const submitData = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Append files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      await api.put('/user/profile/personal', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Personal details saved!');
      onNext();
    } catch (error) {
      toast.error('Failed to save details');
    } finally {
      setLoading(false);
    }
  };

  const renderFileUpload = (fieldName, label, accept = "image/*") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} *
      </label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e, fieldName)}
          className="hidden"
          id={fieldName}
        />
        <label
          htmlFor={fieldName}
          className="flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
        >
          {previews[fieldName] ? (
            <img src={previews[fieldName]} alt={label} className="max-h-32 mb-2" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
          )}
          <span className="text-sm text-gray-600">
            {files[fieldName] ? files[fieldName].name : 'Click to upload'}
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input type="text" name="firstName" value={formData.firstName} disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input type="text" name="lastName" value={formData.lastName} disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input type="email" name="email" value={formData.email} disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
          <input type="tel" name="mobile" value={formData.mobile} disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
          <input type="text" name="gender" value={formData.gender} disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
        </div>
       
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth (A.D.) *</label>
          <input type="date" name="dobAD" value={formData.dobAD} disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">NID Number *</label>
          <input type="text" name="nid" value={formData.nid} disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Citizenship Number *</label>
          <input type="text" name="citizenship" value={formData.citizenship} disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
          <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
          <input type="text" name="motherName" value={formData.motherName} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grandfather's Name</label>
          <input type="text" name="grandFatherName" value={formData.grandFatherName} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Citizenship Issue Place</label>
          <input type="text" name="citizenshipIssuePlace" value={formData.citizenshipIssuePlace} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderFileUpload('photo', 'PP Size Photo')}
          {renderFileUpload('signature', 'Signature')}
          {renderFileUpload('citizenshipFront', 'Citizenship Front')}
          {renderFileUpload('citizenshipBack', 'Citizenship Back')}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSubmit} disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save & Next'}
        </button>
      </div>
    </div>
  );
};

export default PersonalDetails;