import React, { useState, useEffect } from 'react';
import {
  Edit,
  Trash2,
  X,
  CalendarDays,
  BadgeIndianRupee,
  Briefcase,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const VacancyManagement = () => {
  const [feeError, setFeeError] = useState('');
  const [vacancies, setVacancies] = useState([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [newVacancy, setNewVacancy] = useState({
    vacancyName: '',
    lastDate: '',
    doubleFeeLastDate: '',
    regularFee: '',
    doubleFee: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        navigate('/admin/login');
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await api.get('/admin/vacancy/status');
      setVacancies(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch vacancies');
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    }
  };

  const handleCreateVacancy = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await api.post('/admin/vacancy', newVacancy);

      toast.success('Vacancy created successfully!');
      setNewVacancy({
        vacancyName: '',
        lastDate: '',
        doubleFeeLastDate: '',
        regularFee: '',
        doubleFee: '',
        description: ''
      });

      fetchVacancies();
    } catch (error) {
      toast.error('Failed to create vacancy');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVacancy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vacancy?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await api.delete(`/admin/vacancy/${id}`);
      toast.success('Vacancy deleted');
      fetchVacancies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const openUpdateModal = (vacancy) => {
    const formattedVacancy = {
      ...vacancy,
      lastDate: vacancy.lastDate.split('T')[0],
      doubleFeeLastDate: vacancy.doubleFeeLastDate.split('T')[0],
      regularFee: vacancy.regularFee,
      doubleFee: vacancy.doubleFee
    };

    setEditingVacancy(formattedVacancy);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await api.put(`/admin/vacancy/${editingVacancy._id}`, editingVacancy);

      toast.success('Vacancy updated');
      setIsUpdateModalOpen(false);
      fetchVacancies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Vacancy Section */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Create Vacancy</h2>
              <p className="text-sm text-gray-500 mt-1">
                Add a new company vacancy with dates, fees, and description.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateVacancy} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vacancy Name *
              </label>
              <input
                type="text"
                value={newVacancy.vacancyName}
                onChange={(e) =>
                  setNewVacancy({ ...newVacancy, vacancyName: e.target.value })
                }
                placeholder="Enter vacancy / company name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CalendarDays className="w-4 h-4" />
                Last Date *
              </label>
              <input
                type="date"
                value={newVacancy.lastDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  const today = new Date().toISOString().split('T')[0];

                  if (selectedDate < today) {
                    toast.error('Last Date cannot be in the past');
                    return;
                  }

                  setNewVacancy({
                    ...newVacancy,
                    lastDate: selectedDate,
                    doubleFeeLastDate: ''
                  });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CalendarDays className="w-4 h-4" />
                Double Fee Last Date *
              </label>
              <input
                type="date"
                value={newVacancy.doubleFeeLastDate}
                disabled={!newVacancy.lastDate}
                min={
                  newVacancy.lastDate
                    ? new Date(newVacancy.lastDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                }
                onChange={(e) => {
                  const selectedDate = e.target.value;

                  if (!newVacancy.lastDate) {
                    toast.error('Please select Last Date first');
                    return;
                  }

                  if (selectedDate <= newVacancy.lastDate) {
                    toast.error('Double Fee Last Date must be AFTER Last Date');
                    return;
                  }

                  setNewVacancy({
                    ...newVacancy,
                    doubleFeeLastDate: selectedDate
                  });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <BadgeIndianRupee className="w-4 h-4" />
                Regular Fee *
              </label>
              <input
                type="number"
                value={newVacancy.regularFee}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === '') {
                    setFeeError('');
                    setNewVacancy({ ...newVacancy, regularFee: '', doubleFee: '' });
                  } else if (Number(value) <=0) {
                    setFeeError('Fee cannot be 0 or less than 0');
                    setNewVacancy({ ...newVacancy, regularFee: value, doubleFee: '' });
                  } else {
                    setFeeError('');
                    setNewVacancy({
                      ...newVacancy,
                      regularFee: Number(value),
                      doubleFee: Number(value) * 2
                    });
                  }
                }}
                placeholder="Enter regular fee"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
                  feeError ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {feeError && (
                <span className="text-red-500 text-sm mt-2 block">{feeError}</span>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <BadgeIndianRupee className="w-4 h-4" />
                Double Fee *
              </label>
              <input
                type="number"
                value={newVacancy.doubleFee}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed text-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Description
              </label>
              <textarea
                value={newVacancy.description}
                onChange={(e) =>
                  setNewVacancy({ ...newVacancy, description: e.target.value })
                }
                rows="5"
                placeholder="Enter vacancy description, requirements, or notes"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto min-w-[220px] bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Creating...' : 'Create Vacancy'}
            </button>
          </div>
        </form>
      </section>

      {/* Existing Vacancies Section */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Existing Vacancies</h2>
              <p className="text-sm text-gray-500 mt-1">
                View, edit, and manage all created vacancies.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Last Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Double Fee Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fees
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vacancies.length > 0 ? (
                vacancies.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5 font-medium text-gray-800">
                      {v.vacancyName}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {new Date(v.lastDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {new Date(v.doubleFeeLastDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      <span className="font-medium">$ {v.regularFee}</span>
                      <span className="text-gray-400 mx-2">/</span>
                      <span className="font-medium">$ {v.doubleFee}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openUpdateModal(v)}
                          className="inline-flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                          title="Edit Vacancy"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVacancy(v._id)}
                          className="inline-flex items-center justify-center w-10 h-10 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
                          title="Delete Vacancy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    No vacancies available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / Tablet Cards */}
        <div className="lg:hidden p-4 space-y-4">
          {vacancies.length > 0 ? (
            vacancies.map((v) => (
              <div
                key={v._id}
                className="border border-gray-200 rounded-2xl p-5 bg-gray-50"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {v.vacancyName}
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openUpdateModal(v)}
                      className="inline-flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVacancy(v._id)}
                      className="inline-flex items-center justify-center w-10 h-10 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <p className="text-gray-500 text-xs mb-1">Last Date</p>
                    <p className="font-medium text-gray-800">
                      {new Date(v.lastDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <p className="text-gray-500 text-xs mb-1">Double Fee Date</p>
                    <p className="font-medium text-gray-800">
                      {new Date(v.doubleFeeLastDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-gray-200 sm:col-span-2">
                    <p className="text-gray-500 text-xs mb-1">Fees</p>
                    <p className="font-medium text-gray-800">
                      Rs. {v.regularFee} / Rs. {v.doubleFee}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-12">No vacancies available.</div>
          )}
        </div>
      </section>

      {/* Update Modal */}
      {isUpdateModalOpen && editingVacancy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl overflow-hidden max-h-[90vh]">
            <div className="px-6 py-5 border-b bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Update Vacancy</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Edit vacancy information and save changes.
                </p>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="w-10 h-10 rounded-xl hover:bg-white/80 flex items-center justify-center text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
              <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vacancy Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    value={editingVacancy.vacancyName}
                    onChange={(e) =>
                      setEditingVacancy({ ...editingVacancy, vacancyName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    value={editingVacancy.lastDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      setEditingVacancy({
                        ...editingVacancy,
                        lastDate: selectedDate,
                        doubleFeeLastDate:
                          editingVacancy.doubleFeeLastDate <= selectedDate
                            ? ''
                            : editingVacancy.doubleFeeLastDate
                      });
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Double Fee Last Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    value={editingVacancy.doubleFeeLastDate}
                    disabled={!editingVacancy.lastDate}
                    min={editingVacancy.lastDate}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      if (selectedDate <= editingVacancy.lastDate) {
                        toast.error('Double Fee Last Date must be after Last Date');
                        return;
                      }
                      setEditingVacancy({
                        ...editingVacancy,
                        doubleFeeLastDate: selectedDate
                      });
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Regular Fee
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    value={editingVacancy.regularFee}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setEditingVacancy({
                          ...editingVacancy,
                          regularFee: '',
                          doubleFee: ''
                        });
                      } else if (Number(value) < 0) {
                        toast.error('Fee cannot be less than 0');
                        setEditingVacancy({
                          ...editingVacancy,
                          regularFee: value,
                          doubleFee: ''
                        });
                      } else {
                        setEditingVacancy({
                          ...editingVacancy,
                          regularFee: Number(value),
                          doubleFee: Number(value) * 2
                        });
                      }
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Double Fee
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed text-gray-600"
                    value={editingVacancy.doubleFee}
                    readOnly
                  />
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium"
                  >
                    Update Vacancy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacancyManagement;