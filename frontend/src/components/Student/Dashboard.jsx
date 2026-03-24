import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  FileText,
  X,
  CheckCircle,
  Clock,
  IndianRupee,
  Building2,
  AlarmClock,
  BarChart3
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

const CHART_COLORS = ['#7c3aed', '#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#0891b2'];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, paid: 0 });
  const [applications, setApplications] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes, vacanciesRes] = await Promise.all([
        api.get('/vacancy/my-applications'),
        api.get('/vacancy')
      ]);

      const appData = applicationsRes.data || [];
      const vacancyData = vacanciesRes.data || [];

      setApplications(appData);
      setVacancies(vacancyData);

      const statsCount = {
        pending: appData.filter(app => app.status === 'pending').length,
        approved: appData.filter(app => app.status === 'approved').length,
        rejected: appData.filter(app => app.status === 'rejected').length,
        paid: appData.filter(app => Number(app.feePaid) > 0).length
      };

      setStats(statsCount);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Pending', value: stats.pending, color: 'bg-yellow-100 text-yellow-600', icon: Clock },
    { title: 'Approved', value: stats.approved, color: 'bg-green-100 text-green-600', icon: CheckCircle },
    { title: 'Rejected', value: stats.rejected, color: 'bg-red-100 text-red-600', icon: X },
    { title: 'Paid', value: stats.paid, color: 'bg-blue-100 text-blue-600', icon: IndianRupee }
  ];

  const companyApplicationData = useMemo(() => {
    const map = {};
    applications.forEach((app) => {
      const name = app.vacancy?.vacancyName || 'Unknown';
      map[name] = (map[name] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, applications]) => ({ name, applications }))
      .sort((a, b) => b.applications - a.applications);
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

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.createdAt || b.applicationDate) - new Date(a.createdAt || a.applicationDate))
      .slice(0, 5);
  }, [applications]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <div className="p-6 space-y-6">
          {/* Hero */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Candidate Dashboard</h1>
                <p className="text-blue-100 mt-2 max-w-2xl">
                  Track your application progress, payment status, active company deadlines, and recent submissions.
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
                <p className="text-sm text-blue-100">Your Total Applications</p>
                <p className="text-3xl font-bold">{applications.length}</p>
                <p className="text-sm text-blue-100 mt-1">Across all companies</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                </div>
              );
            })}
          </div>

          {/* Middle Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Company Application Chart */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Applications by Company
                </h2>
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

            {/* Countdown Tracker */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <AlarmClock className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Vacancy Countdown Tracker
                </h2>
              </div>

              <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                {countdownVacancies.length > 0 ? (
                  countdownVacancies.map((vacancy) => (
                    <div
                      key={vacancy._id}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="truncate">{vacancy.vacancyName}</span>
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Last Date: {new Date(vacancy.lastDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Double Fee Last Date: {new Date(vacancy.doubleFeeLastDate).toLocaleDateString()}
                          </p>
                        </div>

                        <div
                          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${vacancy.expired
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
                  <p className="text-gray-500 text-sm">No active vacancies found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Recent Applications</h2>
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No applications yet</div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div
                    key={app._id}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {app.vacancy?.vacancyName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">Quota: {app.quota}</p>

                          <div className="flex items-center flex-wrap gap-2 mt-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : app.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                                }`}
                            >
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>

                            {Number(app.feePaid) > 0 && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Paid
                              </span>
                            )}

                            <span className="text-xs text-gray-500">
                              {new Date(app.applicationDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm text-gray-500">Fee Paid</p>
                        <p className="font-semibold text-gray-800">Rs. {app.feePaid}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;