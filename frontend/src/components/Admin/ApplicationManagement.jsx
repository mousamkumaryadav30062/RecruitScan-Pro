import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Briefcase, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ApplicationDetails from './ApplicationDetails';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
    fetchVacancies();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        navigate('/admin/login');
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const res = await api.get('/admin/applications');
      setApplications(res.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
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

      const res = await api.get('/admin/vacancy/status');
      setVacancies(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch vacancies');
    }
  };

  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    if (selectedVacancy !== 'all') {
      filtered = filtered.filter((app) => app.vacancy?._id === selectedVacancy);
    }

   if (statusFilter !== 'all') {
  if (statusFilter === 'paid') {
    filtered = filtered.filter((app) => Number(app.feePaid) > 0);
  } else {
    filtered = filtered.filter((app) => app.status === statusFilter);
  }
}

    return filtered;
  }, [applications, selectedVacancy, statusFilter]);

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

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

const handleStatusUpdate = async (applicationId, status, rejectionReason = '') => {
  try {
    const token = localStorage.getItem('adminToken');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await api.put('/admin/applications/status', {
      applicationId,
      status,
      rejectionReason
    });

    toast.success(`Application ${status}!`);
    fetchApplications();
    setShowDetailsModal(false);
  } catch (error) {
    toast.error('Failed to update status');
    throw error;
  }
};

  const getStatusBadge = (status) => {
    if (status === 'approved') {
      return 'bg-green-100 text-green-700';
    }
    if (status === 'rejected') {
      return 'bg-red-100 text-red-700';
    }
    if (status === 'paid') {
      return 'bg-blue-100 text-blue-700';
    }
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Panel - Vacancy List */}
     <div className="lg:col-span-4 xl:col-span-3">
  <div className="bg-white rounded-xl shadow-md overflow-hidden h-full min-h-[700px] flex flex-col">
    <div className="px-5 py-4 border-b bg-gray-50">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-purple-600" />
        Vacancies / Companies
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Select a company vacancy to view its applications
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
            <p className="text-sm text-gray-500">Show all applications</p>
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
              <h3 className="font-semibold text-gray-800">
                {vacancy.vacancyName}
              </h3>
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

      {/* Right Panel - Applications */}
      <div className="lg:col-span-8 xl:col-span-9">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Applications
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedVacancy === 'all'
                  ? 'Showing applications for all vacancies'
                  : `Showing applications for selected vacancy`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <div className="px-4 py-2 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium">
                Total: {filteredApplications.length}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vacancy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fee Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Symbol No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {app.user?.firstName} {app.user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{app.user?.email}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">
                        {app.vacancy?.vacancyName || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">
                        {app.quota}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">
                        Rs. {app.feePaid}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status === 'pending'
                            ? 'Pending'
                            : app.status === 'paid'
                            ? 'Paid'
                            : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">
                        {app.symbolNumber || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-800">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(app)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FileText className="w-10 h-10 mb-3 text-gray-300" />
                        <p className="text-base font-medium">
                          No applications found
                        </p>
                        <p className="text-sm">
                          Try selecting another vacancy or changing the status filter
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetailsModal && selectedApplication && (
        <ApplicationDetails
          application={selectedApplication}
          onClose={() => setShowDetailsModal(false)}
          onStatusUpdate={handleStatusUpdate}
          onRefresh={fetchApplications}
        />
      )}
    </div>
  );
};

export default ApplicationManagement;