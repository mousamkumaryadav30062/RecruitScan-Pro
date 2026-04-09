import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  FileText,
  Briefcase,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const defaultRules = `1. Candidates must bring their admit card to the examination center.
2. No electronic devices (mobile phones, calculators, etc.) are allowed.
3. Candidates must arrive at least 30 minutes before the exam starts.
4. Late entry will not be permitted after the exam has started.
5. Candidates must carry valid ID proof along with the admit card.
6. Any form of malpractice will result in disqualification.
7. Follow all instructions given by the invigilators.
8. Maintain silence and discipline in the examination hall.`;

const AdmitCardGenerator = () => {
  const [applications, setApplications] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [admitCardData, setAdmitCardData] = useState({
    examDate: '',
    examTime: '',
    rules: defaultRules
  });

  const [errors, setErrors] = useState({
    examDate: '',
    examTime: ''
  });

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
        const nameA = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase();
        const nameB = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();
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
      filtered = filtered.filter((app) => app.vacancy?._id === selectedVacancy);
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

  const selectedVacancyObj = useMemo(() => {
    return vacancies.find((v) => v._id === selectedVacancy) || null;
  }, [vacancies, selectedVacancy]);

  const validateExamData = (targetVacancy) => {
    if (!admitCardData.examDate || !admitCardData.examTime) {
      toast.error('Please fill exam date and time');
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(admitCardData.examDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('Exam date cannot be in the past');
      return false;
    }

    const doubleFeeDate = targetVacancy?.doubleFeeLastDate
      ? new Date(targetVacancy.doubleFeeLastDate)
      : null;

    if (doubleFeeDate) {
      doubleFeeDate.setHours(0, 0, 0, 0);
      if (selectedDate <= doubleFeeDate) {
        toast.error('Exam date must be AFTER Double Fee Last Date');
        return false;
      }
    }

    const [hours, minutes] = admitCardData.examTime.split(':').map(Number);
    if (hours < 10 || hours > 17 || (hours === 17 && minutes > 0)) {
      toast.error('Exam time must be between 10:00 and 17:00');
      return false;
    }

    return true;
  };

  const handleGenerateSingle = async () => {
    if (!selectedApp) return;

    if (!validateExamData(selectedApp.vacancy)) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await api.post('/admin/admit-card/generate', {
        applicationId: selectedApp._id,
        ...admitCardData
      });

      toast.success('Admit card generated successfully!');
      setShowPreview(false);
      setSelectedApp(null);
      fetchApprovedApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate admit card');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCompanyWise = async () => {
    if (selectedVacancy === 'all') {
      toast.error('Please select a company/vacancy first');
      return;
    }

    if (!selectedVacancyObj) {
      toast.error('Selected vacancy not found');
      return;
    }

    if (!validateExamData(selectedVacancyObj)) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await api.post('/admin/admit-card/generate-all', {
        vacancyId: selectedVacancy,
        ...admitCardData
      });

      toast.success('Admit cards generated for selected company!');
      fetchApprovedApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate admit cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setAdmitCardData({ ...admitCardData, examDate: value });

    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const vacancyForValidation = selectedApp?.vacancy || selectedVacancyObj;
    const doubleFeeDate = vacancyForValidation?.doubleFeeLastDate
      ? new Date(vacancyForValidation.doubleFeeLastDate)
      : null;

    if (doubleFeeDate) {
      doubleFeeDate.setHours(0, 0, 0, 0);
      if (selectedDate <= doubleFeeDate) {
        setErrors((prev) => ({
          ...prev,
          examDate: 'Exam date must be AFTER Double Fee Last Date'
        }));
        return;
      }
    }

    if (selectedDate < today) {
      setErrors((prev) => ({
        ...prev,
        examDate: 'Exam date cannot be in the past'
      }));
    } else {
      setErrors((prev) => ({ ...prev, examDate: '' }));
    }
  };

  const handleTimeChange = (e) => {
    const value = e.target.value;
    setAdmitCardData({ ...admitCardData, examTime: value });

    const [hours, minutes] = value.split(':').map(Number);
    if (hours < 10 || hours > 17 || (hours === 17 && minutes > 0)) {
      setErrors((prev) => ({
        ...prev,
        examTime: 'Exam time must be between 10:00 and 17:00'
      }));
    } else {
      setErrors((prev) => ({ ...prev, examTime: '' }));
    }
  };

  const renderAdmitCardPreview = () => {
    if (!selectedApp) return null;
    const user = selectedApp.user;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-4xl w-full p-8">
          <div className="border-4 border-blue-600 p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-blue-600">ADMIT CARD</h1>
              <h2 className="text-xl font-semibold text-gray-800 mt-2">
                {selectedApp.vacancy?.vacancyName}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                  Student Details
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-40 text-gray-600">Name:</span>
                    <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-gray-600">Master ID:</span>
                    <span className="font-medium">{user?.masterId}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-gray-600">Symbol Number:</span>
                    <span className="font-medium text-blue-600">{selectedApp.symbolNumber}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-gray-600">NI Number:</span>
                    <span className="font-medium">{user?.niNumber}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-gray-600">Gender:</span>
                    <span className="font-medium">{user?.gender}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                  Exam Details
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-40 text-gray-600">Exam Date:</span>
                    <span className="font-medium">
                      {admitCardData.examDate
                        ? new Date(admitCardData.examDate).toLocaleDateString()
                        : 'Not Set'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-gray-600">Exam Time:</span>
                    <span className="font-medium">{admitCardData.examTime || 'Not Set'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-gray-600">Exam Center:</span>
                    <span className="font-medium">{selectedApp.examCenter}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-gray-600">Quota:</span>
                    <span className="font-medium">{selectedApp.quota}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                Instructions & Rules
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {admitCardData.rules}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-300 text-center">
              <p className="text-sm text-gray-600">
                This is a computer-generated admit card and does not require a signature.
              </p>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => {
                setShowPreview(false);
                setSelectedApp(null);
              }}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>

            <button
              onClick={handleGenerateSingle}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Admit Card'}
            </button>
          </div>
        </div>
      </div>
    );
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
              Select a company to generate admit cards
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
      <div className="lg:col-span-8 xl:col-span-9 space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Admit Card Generator</h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedVacancy === 'all'
                  ? 'Select a company to generate admit cards'
                  : 'Generate admit cards for the selected company only'}
              </p>
            </div>

            <div className="px-4 py-2 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium">
              Total Candidates: {filteredApplications.length}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">Exam Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Exam Date *
              </label>
              <input
                type="date"
                value={admitCardData.examDate}
                min={
                  selectedVacancyObj?.doubleFeeLastDate
                    ? new Date(
                        new Date(selectedVacancyObj.doubleFeeLastDate).setDate(
                          new Date(selectedVacancyObj.doubleFeeLastDate).getDate() + 1
                        )
                      ).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                }
                onChange={handleDateChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.examDate && <p className="text-red-500 text-sm mt-1">{errors.examDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-2" />
                Exam Time *
              </label>
              <input
                type="time"
                value={admitCardData.examTime}
                onChange={handleTimeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.examTime && <p className="text-red-500 text-sm mt-1">{errors.examTime}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-2" />
                Rules & Regulations
              </label>
              <textarea
                value={admitCardData.rules}
                onChange={(e) =>
                  setAdmitCardData({ ...admitCardData, rules: e.target.value })
                }
                rows="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateCompanyWise}
            disabled={loading || selectedVacancy === 'all'}
            className="mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Admit Cards for Selected Company'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Eligible Candidates</h3>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Approved applications only
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vacancy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Center</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {app.user?.firstName} {app.user?.lastName}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {app.vacancy?.vacancyName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{app.symbolNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{app.examCenter || '-'}</td>
                      <td className="px-6 py-4">
                        {app.admitCardGenerated ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Generated
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            Not Generated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {app.symbolNumber && app.examCenter ? (
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setAdmitCardData({
                                examDate: app.admitCardData?.examDate
                                  ? new Date(app.admitCardData.examDate).toISOString().split('T')[0]
                                  : admitCardData.examDate,
                                examTime: app.admitCardData?.examTime || admitCardData.examTime,
                                rules: app.admitCardData?.rules || admitCardData.rules
                              });
                              setShowPreview(true);
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Preview</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">Assign symbol & center first</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No approved applications found for the selected company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPreview && renderAdmitCardPreview()}
    </div>
  );
};

export default AdmitCardGenerator;