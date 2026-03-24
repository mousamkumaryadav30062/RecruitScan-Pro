import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Banknote } from 'lucide-react';

const Vacancy = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vacancies, setVacancies] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [selectedQuota, setSelectedQuota] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVacancies();
    fetchMyApplications();
  }, []);

  const fetchVacancies = async () => {
    try {
      const { data } = await api.get('/vacancy');
      setVacancies(data);
    } catch (error) {
      toast.error('Failed to fetch vacancies');
    }
  };

  const fetchMyApplications = async () => {
    try {
      const { data } = await api.get('/vacancy/my-applications');
      setMyApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications');
    }
  };

  const getApplicationForVacancy = (vacancyId) => {
    return myApplications.find((app) => app.vacancy?._id === vacancyId);
  };

  const isApplied = (vacancyId) => {
    const app = getApplicationForVacancy(vacancyId);
    return app && app.status !== 'rejected';
  };

  const isRejectedAndCanReapply = (vacancyId) => {
    const app = getApplicationForVacancy(vacancyId);
    return app && app.status === 'rejected' && app.canReapply;
  };

  const handleApply = (vacancy) => {
    setSelectedVacancy(vacancy);
    setShowConfirm(true);
  };

  const confirmApplication = async () => {
    if (!selectedQuota) {
      toast.error('Please select a quota');
      return;
    }

    setLoading(true);
    try {
      await api.post('/vacancy/apply', {
        vacancyId: selectedVacancy._id,
        quota: selectedQuota
      });

      const existingRejected = getApplicationForVacancy(selectedVacancy._id);
      toast.success(
        existingRejected?.status === 'rejected'
          ? 'Application re-applied successfully!'
          : 'Application submitted successfully!'
      );

      setShowConfirm(false);
      setSelectedVacancy(null);
      setSelectedQuota('');
      fetchMyApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  const getFeeAmount = (vacancy) => {
    if (!vacancy) return 0;

    const currentDate = new Date();
    const lastDate = new Date(vacancy.lastDate);
    const doubleFeeLastDate = new Date(vacancy.doubleFeeLastDate);

    if (currentDate > doubleFeeLastDate) {
      return 'Date Exceeded';
    } else if (currentDate > lastDate) {
      return vacancy.doubleFee;
    } else {
      return vacancy.regularFee;
    }
  };

  const isApplicationAllowed = (vacancy) => {
    const currentDate = new Date();
    const doubleFeeLastDate = new Date(vacancy.doubleFeeLastDate);
    return currentDate <= doubleFeeLastDate;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Vacancies</h1>

          {vacancies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No vacancies available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vacancies.map((vacancy) => {
                const applied = isApplied(vacancy._id);
                const canReapply = isRejectedAndCanReapply(vacancy._id);
                const rejectedApp = getApplicationForVacancy(vacancy._id);

                return (
                  <div
                    key={vacancy._id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                  >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      {vacancy.vacancyName}
                    </h2>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Last Date</p>
                          <p className="text-sm">
                            {new Date(vacancy.lastDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-5 h-5 mr-3 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Double Date</p>
                          <p className="text-sm">
                            {new Date(vacancy.doubleFeeLastDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Banknote
                          className="w-5 h-5 mr-3"
                          style={{
                            color:
                              new Date() > new Date(vacancy.doubleFeeLastDate)
                                ? 'red'
                                : 'green'
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium">Fee</p>
                          <p
                            className={`text-sm font-bold ${
                              new Date() > new Date(vacancy.doubleFeeLastDate)
                                ? 'text-red-600'
                                : new Date() > new Date(vacancy.lastDate)
                                ? 'text-purple-600'
                                : 'text-green-600'
                            }`}
                          >
                            {new Date() > new Date(vacancy.doubleFeeLastDate)
                              ? 'Date Exceeded'
                              : new Date() > new Date(vacancy.lastDate)
                              ? `Rs. ${vacancy.doubleFee}`
                              : `Rs. ${vacancy.regularFee}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {rejectedApp?.status === 'rejected' && rejectedApp?.rejectionReason && (
                      <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                        <p className="text-sm font-semibold text-red-700 mb-1">
                          Previous Rejection Reason:
                        </p>
                        <p className="text-sm text-red-600">
                          {rejectedApp.rejectionReason}
                        </p>
                      </div>
                    )}

                    {(() => {
                      if (applied) {
                        return (
                          <button
                            disabled
                            className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            <span>Already Applied</span>
                          </button>
                        );
                      }

                      if (!isApplicationAllowed(vacancy)) {
                        return (
                          <button
                            disabled
                            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold cursor-not-allowed"
                          >
                            Date Exceeded - Cannot Apply
                          </button>
                        );
                      }

                      if (canReapply) {
                        return (
                          <button
                            onClick={() => handleApply(vacancy)}
                            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700"
                          >
                            Re-apply
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={() => handleApply(vacancy)}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                        >
                          Apply Now
                        </button>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}

          {showConfirm && selectedVacancy && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {isRejectedAndCanReapply(selectedVacancy._id)
                    ? 'Confirm Re-application'
                    : 'Confirm Application'}
                </h3>

                <p className="text-gray-600 mb-6">{selectedVacancy.vacancyName}</p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Quota *
                  </label>
                  <select
                    value={selectedQuota}
                    onChange={(e) => setSelectedQuota(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Quota</option>
                    <option value="open">Open</option>
                    <option value="women">Women</option>
                    <option value="dalit">Disabled</option>
                    <option value="janajati">Backward Region</option>
                    
                  </select>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600 mb-2">Application Fee</p>
                  <p
                    className={`text-3xl font-bold ${
                      new Date() > new Date(selectedVacancy.doubleFeeLastDate)
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {new Date() > new Date(selectedVacancy.doubleFeeLastDate)
                      ? 'Date Exceeded'
                      : new Date() > new Date(selectedVacancy.lastDate)
                      ? `Rs. ${selectedVacancy.doubleFee}`
                      : `Rs. ${selectedVacancy.regularFee}`}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowConfirm(false);
                      setSelectedVacancy(null);
                      setSelectedQuota('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmApplication}
                    disabled={
                      loading ||
                      !selectedQuota ||
                      new Date() > new Date(selectedVacancy.doubleFeeLastDate)
                    }
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading
                      ? 'Processing...'
                      : isRejectedAndCanReapply(selectedVacancy._id)
                      ? 'Confirm Re-apply'
                      : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vacancy;