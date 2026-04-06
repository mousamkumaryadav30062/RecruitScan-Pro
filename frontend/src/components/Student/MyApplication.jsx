import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  AlertCircle,
  Clock3,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Building2,
  CreditCard,
  Eye,
  Printer
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MyApplication = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmitCard, setSelectedAdmitCard] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL.replace('/api', '');

  useEffect(() => {
    if (selectedAdmitCard) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedAdmitCard]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/vacancy/my-applications');
      setApplications(data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      paid: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle2 className="w-4 h-4" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4" />;
    return <Clock3 className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">My Applications</h1>
                <p className="text-blue-100 mt-2 max-w-2xl">
                  Review your submitted forms, check approval status, and download admit cards when available.
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
                <p className="text-sm text-blue-100">Total Applications</p>
                <p className="text-3xl font-bold">{applications.length}</p>
                <p className="text-sm text-blue-100 mt-1">Submitted so far</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-lg font-medium text-gray-700">Loading applications...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait a moment.</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700">No applications found</p>
              <p className="text-sm text-gray-500 mt-2">
                You have not submitted any application yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-xl font-bold text-gray-800 break-words">
                              {app.vacancy?.vacancyName}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                              Applied on {new Date(app.applicationDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(app.status)}`}
                        >
                          {getStatusIcon(app.status)}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>

                        {Number(app.feePaid) > 0 && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border bg-blue-100 text-blue-700 border-blue-200">
                            <CreditCard className="w-4 h-4" />
                            Paid
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Quota</p>
                        <p className="font-semibold text-gray-800">{app.quota}</p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Fee Paid</p>
                        <p className="font-semibold text-gray-800"> $ {app.feePaid}</p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Symbol Number</p>
                        <p className="font-semibold text-blue-600">
                          {app.symbolNumber || 'Not Assigned'}
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Exam Center</p>
                        <p className="font-semibold text-gray-800">
                          {app.examCenter || 'Not Assigned'}
                        </p>
                      </div>
                    </div>

                    {app.status === 'rejected' && app.rejectionReason && (
                      <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-red-800 mb-1">Rejection Reason</p>
                            <p className="text-sm text-red-700">{app.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {app.status === 'approved' && (
                      <div className="mt-5 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => setSelectedAdmitCard(app)}
                          disabled={!app.admitCardGenerated}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {app.admitCardGenerated ? (
                            <>
                              <Eye className="w-5 h-5" />
                              <span>View Admit Card</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5" />
                              <span>Admit Card Not Ready</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedAdmitCard && (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 md:p-6">
            <div className="bg-white rounded-3xl max-w-5xl w-full my-8 shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Admit Card Preview</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Review your admit card before printing.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAdmitCard(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
                >
                  Close
                </button>
              </div>

              <div className="p-6">
                <div
                  className="border-4 border-blue-600 rounded-2xl p-6 md:p-8 bg-white"
                  id="admit-card-print"
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-blue-600">ADMIT CARD</h1>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mt-2">
                      {selectedAdmitCard.vacancy?.vacancyName}
                    </h2>
                  </div>

                  <div className="print-top-grid grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2">
                      <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2 text-lg">
                        Student Details
                      </h3>

                      <div className="space-y-3 text-sm md:text-base">
                        <div className="print-row">
                          <span className="print-label">Name:</span>
                          <span className="print-value">
                            {selectedAdmitCard.user?.firstName} {selectedAdmitCard.user?.lastName}
                          </span>
                        </div>

                        <div className="print-row">
                          <span className="print-label">Master ID:</span>
                          <span className="print-value">{selectedAdmitCard.user?.masterId}</span>
                        </div>

                        <div className="print-row">
                          <span className="print-label">Symbol Number:</span>
                          <span className="print-value text-blue-600 font-semibold">
                            {selectedAdmitCard.symbolNumber}
                          </span>
                        </div>

                        <div className="print-row">
                          <span className="print-label">Citizenship:</span>
                          <span className="print-value">{selectedAdmitCard.user?.citizenship}</span>
                        </div>

                        <div className="print-row">
                          <span className="print-label">Gender:</span>
                          <span className="print-value capitalize">{selectedAdmitCard.user?.gender}</span>
                        </div>

                        <div className="print-row">
                          <span className="print-label">Exam Date:</span>
                          <span className="print-value">
                            {selectedAdmitCard.admitCardData?.examDate
                              ? new Date(selectedAdmitCard.admitCardData.examDate).toLocaleDateString()
                              : 'TBA'}
                          </span>
                        </div>

                        <div className="print-row">
                          <span className="print-label">Exam Time:</span>
                          <span className="print-value">
                            {selectedAdmitCard.admitCardData?.examTime || 'TBA'}
                          </span>
                        </div>

                        <div className="print-row">
                          <span className="print-label">Exam Center:</span>
                          <span className="print-value">{selectedAdmitCard.examCenter}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedAdmitCard.user?.photo && (
                        <div className="print-box print-photo border border-gray-300 rounded-2xl p-3 bg-gray-50">
                          <img
                            src={`${API_URL}/uploads/${selectedAdmitCard.user.photo}`}
                            alt="Photo"
                            className="w-full h-44 object-cover rounded-xl"
                          />
                          <p className="text-center text-xs text-gray-600 mt-2">Photo</p>
                        </div>
                      )}

                      {selectedAdmitCard.user?.signature && (
                        <div className="print-box print-signature border border-gray-300 rounded-2xl p-3 bg-gray-50">
                          <img
                            src={`${API_URL}/uploads/${selectedAdmitCard.user.signature}`}
                            alt="Signature"
                            className="w-full h-24 object-contain bg-white rounded-xl"
                          />
                          <p className="text-center text-xs text-gray-600 mt-2">Signature</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {(selectedAdmitCard.user?.citizenshipFront || selectedAdmitCard.user?.citizenshipBack) && (
                    <div className="print-section mb-8">
                      <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2 text-lg">
                        Citizenship
                      </h3>

                      <div className="print-doc-grid grid grid-cols-1 md:grid-cols-2 gap-5">
                        {selectedAdmitCard.user?.citizenshipFront && (
                          <div className="print-box print-citizenship border border-gray-300 rounded-2xl p-3 bg-gray-50">
                            <img
                              src={`${API_URL}/uploads/${selectedAdmitCard.user.citizenshipFront}`}
                              alt="Citizenship Front"
                              className="w-full h-52 object-cover rounded-xl"
                            />
                            <p className="text-center text-xs text-gray-600 mt-2">Front</p>
                          </div>
                        )}

                        {selectedAdmitCard.user?.citizenshipBack && (
                          <div className="print-box print-citizenship border border-gray-300 rounded-2xl p-3 bg-gray-50">
                            <img
                              src={`${API_URL}/uploads/${selectedAdmitCard.user.citizenshipBack}`}
                              alt="Citizenship Back"
                              className="w-full h-52 object-cover rounded-xl"
                            />
                            <p className="text-center text-xs text-gray-600 mt-2">Back</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="print-section mt-6">
                    <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2 text-lg">
                      Instructions
                    </h3>
                    <div className="text-sm text-gray-700 whitespace-pre-line leading-7">
                      {(selectedAdmitCard.admitCardData?.rules || 'Instructions will be provided.')
                        .split('\n')
                        .slice(0, 8)
                        .join('\n')}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t text-center">
                    <p className="text-sm text-gray-600">
                      This is a computer-generated admit card.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => setSelectedAdmitCard(null)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    <Printer className="w-5 h-5" />
                    <span>Print Admit Card</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @page {
          size: A4;
          margin: 12mm;
        }

        @media print {
          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden !important;
          }

          #admit-card-print,
          #admit-card-print * {
            visibility: visible !important;
          }

          #admit-card-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 186mm !important;
            min-height: auto !important;
            margin: 0 auto !important;
            padding: 8mm !important;
            box-sizing: border-box !important;
            background: white !important;
            border: 2px solid #2563eb !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }

          .fixed,
          .sticky,
          .shadow-2xl,
          .shadow-xl,
          .shadow-lg,
          .shadow-md,
          .rounded-3xl,
          .rounded-2xl,
          .rounded-xl {
            box-shadow: none !important;
          }

          #admit-card-print h1 {
            font-size: 24pt !important;
            line-height: 1.2 !important;
            margin: 0 0 6mm 0 !important;
            text-align: center !important;
          }

          #admit-card-print h2 {
            font-size: 14pt !important;
            line-height: 1.3 !important;
            margin: 0 0 6mm 0 !important;
            text-align: center !important;
          }

          #admit-card-print h3 {
            font-size: 11pt !important;
            margin: 0 0 3mm 0 !important;
          }

          #admit-card-print p,
          #admit-card-print span,
          #admit-card-print div {
            font-size: 10pt !important;
            line-height: 1.45 !important;
          }

          #admit-card-print .print-top-grid {
            display: grid !important;
            grid-template-columns: 1.8fr 0.9fr !important;
            gap: 8mm !important;
            align-items: start !important;
            margin-bottom: 6mm !important;
          }

          #admit-card-print .print-doc-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6mm !important;
            margin-top: 4mm !important;
          }

          #admit-card-print .print-row {
            display: grid !important;
            grid-template-columns: 42mm 1fr !important;
            gap: 4mm !important;
            margin-bottom: 2.5mm !important;
            align-items: start !important;
          }

          #admit-card-print .print-label {
            font-weight: 600 !important;
            color: #374151 !important;
          }

          #admit-card-print .print-value {
            color: #111827 !important;
            word-break: break-word !important;
          }

          #admit-card-print img {
            width: 100% !important;
            height: auto !important;
            object-fit: contain !important;
            display: block !important;
            background: white !important;
          }

          #admit-card-print .print-photo img {
            max-height: 42mm !important;
            object-fit: cover !important;
          }

          #admit-card-print .print-signature img {
            max-height: 18mm !important;
            object-fit: contain !important;
          }

          #admit-card-print .print-citizenship img {
            max-height: 50mm !important;
            object-fit: cover !important;
          }

          #admit-card-print .print-box {
            border: 1px solid #9ca3af !important;
            padding: 2.5mm !important;
            background: white !important;
          }

          #admit-card-print .print-section {
            margin-top: 5mm !important;
            padding-top: 3mm !important;
            border-top: 1px solid #d1d5db !important;
          }

          #admit-card-print,
          #admit-card-print .print-box,
          #admit-card-print .print-section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyApplication;