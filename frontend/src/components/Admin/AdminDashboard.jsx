import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  FileText,
  CheckCircle,
  LogOut,
  Award,
  Calendar,
  Clock,
  XCircle,
  IndianRupee,
  BarChart3,
  PieChart as PieChartIcon,
  Building2,
  AlarmClock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

import SymbolAssignment from './SymbolAssignment';
import AdmitCardGenerator from './AdmitCardGenerator';
import StudentsView from './StudentsView';
import VacancyManagement from './VacancyManagement';
import ApplicationManagement from './ApplicationManagement';

const CHART_COLORS = ['#7c3aed', '#2563eb', '#16a34a', '#dc2626', '#f59e0b'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    paidApplications: 0
  });
  const [applications, setApplications] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [now, setNow] = useState(Date.now());

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        navigate('/admin/login');
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const [statsRes, appsRes, vacanciesRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/applications'),
        api.get('/admin/vacancy/status')
      ]);

      setStats(statsRes.data);
      setApplications(appsRes.data || []);
      setVacancies(vacanciesRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const handleStatClick = (status) => {
    setActiveTab('applications');
  };

  const companyApplicationData = useMemo(() => {
    const map = {};
    applications.forEach((app) => {
      const vacancyName = app.vacancy?.vacancyName || 'Unknown';
      map[vacancyName] = (map[vacancyName] || 0) + 1;
    });

    return Object.entries(map).map(([name, applications]) => ({
      name,
      applications
    }));
  }, [applications]);

  const genderPieData = useMemo(() => {
    const counts = { male: 0, female: 0, other: 0 };

    applications.forEach((app) => {
      const gender = (app.user?.gender || 'other').toLowerCase();
      if (counts[gender] !== undefined) {
        counts[gender] += 1;
      } else {
        counts.other += 1;
      }
    });

    return [
      { name: 'Male', value: counts.male },
      { name: 'Female', value: counts.female },
      { name: 'Other', value: counts.other }
    ].filter((item) => item.value > 0);
  }, [applications]);

  const statusBarData = useMemo(() => {
    return [
      { name: 'Pending', value: stats.pendingApplications },
      { name: 'Approved', value: stats.approvedApplications },
      { name: 'Rejected', value: stats.rejectedApplications },
      { name: 'Paid', value: stats.paidApplications }
    ];
  }, [stats]);

  const examScheduleData = useMemo(() => {
    const map = new Map();

    applications.forEach((app) => {
      if (app.admitCardGenerated && app.admitCardData?.examDate && app.admitCardData?.examTime) {
        const vacancyName = app.vacancy?.vacancyName || 'Unknown';
        if (!map.has(vacancyName)) {
          map.set(vacancyName, {
            vacancyName,
            examDate: app.admitCardData.examDate,
            examTime: app.admitCardData.examTime,
            examCenter: app.examCenter || '-'
          });
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.examDate) - new Date(b.examDate)
    );
  }, [applications]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }, [applications]);

  const countdownVacancies = useMemo(() => {
    return vacancies.map((vacancy) => {
      const endTime = new Date(vacancy.doubleFeeLastDate).getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        return {
          ...vacancy,
          expired: true,
          countdown: 'Expired'
        };
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      return {
        ...vacancy,
        expired: false,
        countdown: `${days}d ${hours}h ${minutes}m ${seconds}s`
      };
    });
  }, [vacancies, now]);

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      onClick: () => handleStatClick('all')
    },
    {
      title: 'Pending',
      value: stats.pendingApplications,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      onClick: () => handleStatClick('pending')
    },
    {
      title: 'Approved',
      value: stats.approvedApplications,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      onClick: () => handleStatClick('approved')
    },
    {
      title: 'Rejected',
      value: stats.rejectedApplications,
      icon: XCircle,
      color: 'bg-red-100 text-red-600',
      onClick: () => handleStatClick('rejected')
    },
    {
      title: 'Paid',
      value: stats.paidApplications,
      icon: IndianRupee,
      color: 'bg-purple-100 text-purple-600',
      onClick: () => handleStatClick('paid')
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Admin Analytics Dashboard</h2>
            <p className="text-purple-100 mt-2">
              Monitor applications, vacancies, gender trends, deadlines, and exam schedules.
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
            <p className="text-sm text-purple-100">Live Overview</p>
            <p className="text-2xl font-semibold">{stats.totalApplications}</p>
            <p className="text-sm text-purple-100">Total submitted forms</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.title}
              onClick={stat.onClick}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
              </div>
              <p className="text-sm text-gray-500">{stat.title}</p>
            </button>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
  <div className="flex items-center gap-2 mb-5">
    <BarChart3 className="w-5 h-5 text-purple-600" />
    <h3 className="text-lg font-semibold text-gray-800">
      Company-wise Application Trend
    </h3>
  </div>
  
 <div className="h-[340px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart
                     data={companyApplicationData}
                     layout="vertical"
                     margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                   >
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                     <YAxis
                       type="category"
                       dataKey="name"
                       width={95}
                       tick={{ fontSize: 12 }}
                     />
                     <Tooltip />
                     <Bar dataKey="applications" radius={[0, 8, 8, 0]} barSize={22}>
                       {companyApplicationData.map((entry, index) => (
                         <Cell
                           key={`cell-${index}`}
                           fill={CHART_COLORS[index % CHART_COLORS.length]}
                         />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
</div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <PieChartIcon className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Gender Distribution
            </h3>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  label
                >
                  {genderPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Application Status Overview
            </h3>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusBarData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <AlarmClock className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Vacancy Countdown Tracker
            </h3>
          </div>

          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
            {countdownVacancies.length > 0 ? (
              countdownVacancies.map((vacancy) => (
                <div
                  key={vacancy._id}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">{vacancy.vacancyName}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Last date: {new Date(vacancy.lastDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Double fee deadline: {new Date(vacancy.doubleFeeLastDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                        vacancy.expired
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {vacancy.countdown}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No vacancy data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Exam Schedule by Company
            </h3>
          </div>

          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
            {examScheduleData.length > 0 ? (
              examScheduleData.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 bg-indigo-50"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{item.vacancyName}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Exam Center: {item.examCenter || '-'}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-indigo-700">
                        {new Date(item.examDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">{item.examTime}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No exam schedule has been generated yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Applications
            </h3>
          </div>

          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {app.user?.firstName} {app.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {app.vacancy?.vacancyName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(app.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : app.status === 'paid'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent applications available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-600">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>

      <div className="flex h-[calc(100vh-80px)] overflow-hidden">
        <div className="w-64 bg-white shadow-md min-h-screen p-6 overflow-y-auto">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                activeTab === 'dashboard' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('vacancy')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                activeTab === 'vacancy' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Create Vacancy</span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                activeTab === 'applications' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Applications</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                activeTab === 'students' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>All Students</span>
            </button>

            <button
              onClick={() => setActiveTab('symbol')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                activeTab === 'symbol' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Symbol Assignment</span>
            </button>

            <button
              onClick={() => setActiveTab('admit')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                activeTab === 'admit' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100'
              }`}
            >
              <Award className="w-5 h-5" />
              <span>Admit Cards</span>
            </button>
          </nav>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'vacancy' && <VacancyManagement />}
          {activeTab === 'applications' && <ApplicationManagement />}
          {activeTab === 'students' && <StudentsView />}
          {activeTab === 'symbol' && <SymbolAssignment onRefresh={fetchDashboardData} />}
          {activeTab === 'admit' && <AdmitCardGenerator />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;