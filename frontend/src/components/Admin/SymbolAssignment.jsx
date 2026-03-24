import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Hash, MapPin, Briefcase, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SymbolAssignment = ({ onRefresh }) => {
  const [applications, setApplications] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState('all');
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [centerRange, setCenterRange] = useState({ start: '', end: '' });
  const [centerName, setCenterName] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchApprovedApplications();
    fetchVacancies();
  }, []);

  const fetchApprovedApplications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const { data } = await api.get('/admin/applications/approved');

      const sorted = data.sort((a, b) => {
        const nameA = `${a.user?.firstName} ${a.user?.lastName}`.toLowerCase();
        const nameB = `${b.user?.firstName} ${b.user?.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setApplications(sorted);
    } catch (error) {
      toast.error('Failed to fetch applications');
    }
  };

  const fetchVacancies = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const { data } = await api.get('/admin/vacancy/status');
      setVacancies(data);
    } catch (error) {
      toast.error('Failed to fetch vacancies');
    }
  };

  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    if (selectedVacancy !== 'all') {
      filtered = filtered.filter(
        (app) => app.vacancy?._id === selectedVacancy
      );
    }

    return filtered;
  }, [applications, selectedVacancy]);

  const vacancyCounts = useMemo(() => {
    const counts = {};

    applications.forEach((app) => {
      const vacancyId = app.vacancy?._id;
      if (vacancyId) {
        counts[vacancyId] = (counts[vacancyId] || 0) + 1;
      }
    });

    return counts;
  }, [applications]);

  const handleAutoAssignSymbols = async () => {
    if (selectedVacancy === 'all') {
      toast.error('Please select a company/vacancy first');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await api.post('/admin/applications/auto-assign-symbols', {
        vacancyId: selectedVacancy
      });

      toast.success('Symbol numbers assigned successfully!');
      fetchApprovedApplications();
      onRefresh?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign symbol numbers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCenter = async () => {
    if (selectedVacancy === 'all') {
      toast.error('Please select a company/vacancy first');
      return;
    }

    if (!centerRange.start || !centerRange.end || !centerName) {
      toast.error('Please fill all fields');
      return;
    }

    const start = parseInt(centerRange.start);
    const end = parseInt(centerRange.end);

    if (start > end || start < 1 || end > filteredApplications.length) {
      toast.error('Invalid range');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await api.post('/admin/applications/assign-center', {
        vacancyId: selectedVacancy,
        startIndex: start - 1,
        endIndex: end - 1,
        centerName
      });

      toast.success('Exam center assigned successfully!');
      setShowCenterModal(false);
      setCenterRange({ start: '', end: '' });
      setCenterName('');
      fetchApprovedApplications();
      onRefresh?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign exam center');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Panel */}
      <div className="lg:col-span-4 xl:col-span-3">
        <div className="bg-white rounded-xl shadow-md overflow-hidden h-full min-h-[700px] flex flex-col">
          <div className="px-5 py-4 border-b bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Vacancies / Companies
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a company to generate symbols
            </p>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <button
              onClick={() => setSelectedVacancy('all')}
              className={`w-full text-left rounded-xl border p-4 transition ${
                selectedVacancy === 'all'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">All Vacancies</h3>
                  <p className="text-sm text-gray-500">Select one company to proceed</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {applications.length}
                </span>
              </div>
            </button>

            {vacancies.map((vacancy) => (
              <button
                key={vacancy._id}
                onClick={() => setSelectedVacancy(vacancy._id)}
                className={`w-full text-left rounded-xl border p-4 transition ${
                  selectedVacancy === vacancy._id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{vacancy.vacancyName}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Last Date: {new Date(vacancy.lastDate).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 whitespace-nowrap">
                    {vacancyCounts[vacancy._id] || 0}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="lg:col-span-8 xl:col-span-9">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-600" />
                Symbol Number Assignment
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedVacancy === 'all'
                  ? 'Select a company from the left panel'
                  : 'Generate symbols only for the selected company'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAutoAssignSymbols}
                disabled={loading || selectedVacancy === 'all'}
                className="flex items-center space-x-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Hash className="w-5 h-5" />
                <span>{loading ? 'Generating...' : 'Assign Symbols'}</span>
              </button>

              <button
                onClick={() => {
                  if (selectedVacancy === 'all') {
                    toast.error('Please select a company/vacancy first');
                    return;
                  }
                  setShowCenterModal(true);
                }}
                disabled={selectedVacancy === 'all'}
                className="flex items-center space-x-2 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <MapPin className="w-5 h-5" />
                <span>Assign Exam Center</span>
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-white border-b flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Selected Applications: <span className="font-semibold">{filteredApplications.length}</span>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Approved only
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.N.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Master ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vacancy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Center</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quota</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app, index) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{index + 1}</td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {app.user?.firstName} {app.user?.lastName}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">
                        {app.user?.masterId}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">
                        {app.vacancy?.vacancyName || '-'}
                      </td>

                      <td className="px-6 py-4">
                        {app.symbolNumber ? (
                          <span className="font-medium text-blue-600">{app.symbolNumber}</span>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">
                        {app.examCenter || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">{app.quota}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No approved applications found for the selected company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Center Assignment Modal */}
      {showCenterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Assign Exam Center</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Range
                </label>

                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={centerRange.start}
                    onChange={(e) => setCenterRange({ ...centerRange, start: e.target.value })}
                    placeholder="From"
                    min="1"
                    max={filteredApplications.length}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-600">to</span>
                  <input
                    type="number"
                    value={centerRange.end}
                    onChange={(e) => setCenterRange({ ...centerRange, end: e.target.value })}
                    placeholder="To"
                    min="1"
                    max={filteredApplications.length}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Total students in selected company: {filteredApplications.length}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Center Name
                </label>
                <input
                  type="text"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  placeholder="e.g., Kathmandu Center"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowCenterModal(false);
                  setCenterRange({ start: '', end: '' });
                  setCenterName('');
                }}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleAssignCenter}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolAssignment;