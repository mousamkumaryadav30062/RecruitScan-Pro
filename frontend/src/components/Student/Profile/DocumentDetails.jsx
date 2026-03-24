import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { Upload, Plus, Trash2, Pencil, X } from 'lucide-react';

const DocumentDetails = ({ onNext, onPrevious }) => {
  const [educations, setEducations] = useState([]);
  const [formData, setFormData] = useState({
    country: '',
    university: '',
    level: '',
    gpaPercentage: '',
    gradeDivision: '',
    documents: [{ docType: '', file: null }]
  });
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/user/profile');
      setEducations(data.education || []);
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const resetForm = () => {
    setEditingEducationId(null);
    setFormData({
      country: '',
      university: '',
      level: '',
      gpaPercentage: '',
      gradeDivision: '',
      documents: [{ docType: '', file: null }]
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const addDocumentField = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, { docType: '', file: null }]
    }));
  };

  const removeDocumentField = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleDocumentTypeChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc, i) =>
        i === index ? { ...doc, docType: value } : doc
      )
    }));
  };

  const handleDocumentFileChange = (index, file) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc, i) =>
        i === index ? { ...doc, file } : doc
      )
    }));
  };

  const handleEdit = (edu) => {
    setEditingEducationId(edu._id);
    setFormData({
      country: edu.country || '',
      university: edu.university || '',
      level: edu.level || '',
      gpaPercentage: edu.gpaPercentage || '',
      gradeDivision: edu.gradeDivision || '',
      documents: [{ docType: '', file: null }]
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (educationId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this education record?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/user/profile/education/${educationId}`);
      toast.success('Education deleted successfully');

      if (editingEducationId === educationId) {
        resetForm();
      }

      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete education');
    }
  };

  const handleAdd = async () => {
    if (!formData.country || !formData.university || !formData.level) {
      toast.error('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingEducationId) {
        await api.put(`/user/profile/education/${editingEducationId}`, {
          country: formData.country,
          university: formData.university,
          level: formData.level,
          gpaPercentage: formData.gpaPercentage,
          gradeDivision: formData.gradeDivision
        });

        toast.success('Education updated!');
      } else {
        const data = new FormData();

        data.append('country', formData.country);
        data.append('university', formData.university);
        data.append('level', formData.level);
        data.append('gpaPercentage', formData.gpaPercentage);
        data.append('gradeDivision', formData.gradeDivision);

        formData.documents.forEach((doc, index) => {
          if (doc.file) {
            data.append('documents', doc.file);
            data.append(`docType_${index}`, doc.docType || 'Other');
          }
        });

        await api.post('/user/profile/education', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.success('Education added!');
      }

      resetForm();
      fetchProfile();
    } catch (error) {
      toast.error(editingEducationId ? 'Failed to update education' : 'Failed to add education');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editingEducationId ? 'Edit Education Details' : 'Add Education Details'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Add academic records and upload related documents.
              </p>
            </div>

            {editingEducationId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
                <span>Cancel Edit</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Country *', name: 'country', placeholder: 'Enter country' },
              { label: 'University / Board *', name: 'university', placeholder: 'Enter university or board' }
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level *
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select Level</option>
                <option value="SLC">SLC</option>
                <option value="+2">+2</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPA / Percentage
              </label>
              <input
                type="text"
                name="gpaPercentage"
                value={formData.gpaPercentage}
                onChange={handleChange}
                placeholder="e.g. 3.45 or 78%"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade / Division
              </label>
              <input
                type="text"
                name="gradeDivision"
                value={formData.gradeDivision}
                onChange={handleChange}
                placeholder="e.g. First Division / Distinction"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {!editingEducationId && (
            <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">Upload Documents</h3>
                  <p className="text-sm text-gray-500">
                    Add Transcript, Character, Provisional, Migration, or other files.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addDocumentField}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Document</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Document Type
                        </label>
                        <select
                          value={doc.docType}
                          onChange={(e) => handleDocumentTypeChange(index, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select Document Type</option>
                          <option value="Character">Character</option>
                          <option value="Transcript">Transcript</option>
                          <option value="Provisional">Provisional</option>
                          <option value="Migration">Migration</option>
                          <option value="Certificate">Certificate</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload File
                        </label>

                        <input
                          type="file"
                          id={`document-upload-${index}`}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => handleDocumentFileChange(index, e.target.files[0])}
                        />

                        <label
                          htmlFor={`document-upload-${index}`}
                          className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 bg-white text-gray-700"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          <span className="truncate max-w-full">
                            {doc.file ? doc.file.name : 'Choose File'}
                          </span>
                        </label>
                      </div>

                      <div className="md:col-span-2">
                        {formData.documents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDocumentField(index)}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 min-w-[220px]"
            >
              {loading
                ? editingEducationId
                  ? 'Updating...'
                  : 'Adding...'
                : editingEducationId
                ? 'Update Education'
                : 'Add Education'}
            </button>
          </div>
        </div>
      </div>

      {educations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Added Education ({educations.length})
            </h3>
          </div>

          <div className="p-6 space-y-5">
            {educations.map((edu) => (
              <div
                key={edu._id}
                className="border border-gray-200 rounded-2xl bg-gray-50 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {edu.level} - {edu.university}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Country: {edu.country}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleEdit(edu)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                      >
                        <Pencil className="w-4 h-4" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(edu._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <p>
                      <span className="font-medium text-gray-700">Level:</span> {edu.level}
                    </p>

                    <p>
                      <span className="font-medium text-gray-700">Country:</span> {edu.country}
                    </p>

                    <p className="md:col-span-2">
                      <span className="font-medium text-gray-700">University / Board:</span>{' '}
                      {edu.university}
                    </p>

                    {edu.gpaPercentage && (
                      <p>
                        <span className="font-medium text-gray-700">GPA / Percentage:</span>{' '}
                        {edu.gpaPercentage}
                      </p>
                    )}

                    {edu.gradeDivision && (
                      <p>
                        <span className="font-medium text-gray-700">Grade / Division:</span>{' '}
                        {edu.gradeDivision}
                      </p>
                    )}
                  </div>

                  {edu.documents && edu.documents.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <p className="font-medium text-gray-700 mb-3">Uploaded Documents</p>

                      <div className="flex flex-wrap gap-3">
                        {edu.documents.map((doc, docIndex) => (
                          <a
                            key={docIndex}
                            href={`${import.meta.env.VITE_API_BASE_URL}/uploads/${doc.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                          >
                            {doc.docType || 'Document'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DocumentDetails;