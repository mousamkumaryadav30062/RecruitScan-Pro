import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ApplicationDetails = ({ application, onClose, onStatusUpdate }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const user = application.user;
  const API_URL = import.meta.env.VITE_API_URL.replace('/api', '');

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await onStatusUpdate(application._id, 'approved');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await onStatusUpdate(application._id, 'rejected', rejectionReason);
      setShowRejectModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-800">Application Details</h2>
          <button
            onClick={onClose}
            disabled={actionLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Master ID</p>
                <p className="font-medium">{user?.masterId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mobile</p>
                <p className="font-medium">{user?.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium capitalize">{user?.gender}</p>
              </div>
              <div>
  <p className="text-sm text-gray-600">DOB (A.D.)</p>
  <p className="font-medium">
    {user?.dobAD 
      ? new Date(user.dobAD).toISOString().split('T')[0] 
      : 'Not provided'}
  </p>
</div>
              <div>
                <p className="text-sm text-gray-600">National Insurance Number</p>
                <p className="font-medium">{user?.niNumber}</p>
              </div>
              {user?.fatherName && (
                <div>
                  <p className="text-sm text-gray-600">Father's / Parent's Name</p>
                  <p className="font-medium">{user?.fatherName}</p>
                </div>
              )}
              {user?.motherName && (
                <div>
                  <p className="text-sm text-gray-600">Mother's / Parent's Name</p>
                  <p className="font-medium">{user?.motherName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user?.photo && (
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">PP Size Photo</p>
                  <img
                    src={`${API_URL}/uploads/${user.photo}`}
                    alt="Photo"
                    className="w-full h-40 object-cover border-2 border-gray-300 rounded"
                  />
                </div>
              )}
              {user?.signature && (
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Signature</p>
                  <img
                    src={`${API_URL}/uploads/${user.signature}`}
                    alt="Signature"
                    className="w-full h-40 object-contain border-2 border-gray-300 rounded bg-white"
                  />
                </div>
              )}
              {user?.idDocumentFront && (
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Identity Document — Front</p>
                  <img
                    src={`${API_URL}/uploads/${user.idDocumentFront}`}
                    alt="Identity Document Front"
                    className="w-full h-40 object-cover border-2 border-gray-300 rounded"
                  />
                </div>
              )}
              {user?.idDocumentBack && (
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Identity Document — Back</p>
                  <img
                    src={`${API_URL}/uploads/${user.idDocumentBack}`}
                    alt="Identity Document Back"
                    className="w-full h-40 object-cover border-2 border-gray-300 rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          {user?.permanentAddress && (
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">Permanent Address</p>
                  <p className="text-sm">
                    Province: {user?.permanentAddress?.province}, District: {user?.permanentAddress?.district},
                    Local Body: {user?.permanentAddress?.localBody}, Ward: {user?.permanentAddress?.wardNo}, Tole: {user?.permanentAddress?.tole}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">Temporary Address</p>
                  <p className="text-sm">
                    Province: {user?.temporaryAddress?.province}, District: {user?.temporaryAddress?.district},
                    Local Body: {user?.temporaryAddress?.localBody}, Ward: {user?.temporaryAddress?.wardNo}, Tole: {user?.temporaryAddress?.tole}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          {application.user?.education && application.user.education.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Education Details</h3>

              <div className="space-y-4">
                {application.user.education.map((edu, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <p>
                        <span className="font-medium text-gray-700">Level:</span> {edu.level}
                      </p>

                      <p>
                        <span className="font-medium text-gray-700">Country:</span> {edu.country}
                      </p>

                      <p className="md:col-span-2">
                        <span className="font-medium text-gray-700">University / Board:</span> {edu.university}
                      </p>

                      {edu.gpaPercentage && (
                        <p>
                          <span className="font-medium text-gray-700">GPA / Percentage:</span> {edu.gpaPercentage}
                        </p>
                      )}

                      {edu.gradeDivision && (
                        <p>
                          <span className="font-medium text-gray-700">Grade / Division:</span> {edu.gradeDivision}
                        </p>
                      )}
                    </div>

                    {edu.documents && edu.documents.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="font-medium text-gray-700">Uploaded Documents:</p>

                        {edu.documents.map((doc, docIndex) => (
                          <a
                            key={docIndex}
                            href={`${API_URL}/uploads/${doc.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-600 underline"
                          >
                            {doc.docType || 'Document'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Details */}
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Vacancy</p>
                <p className="font-medium">{application.vacancy?.vacancyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quota</p>
                <p className="font-medium">{application.quota}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fee Paid</p>
                <p className="font-medium">Rs. {application.feePaid}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Application Date</p>
                <p className="font-medium">{new Date(application.applicationDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  application.status === 'approved' ? 'bg-green-100 text-green-700' :
                  application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  application.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          {application.status === 'rejected' && application.rejectionReason && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Rejection Reason</h3>
              <p className="text-gray-700">{application.rejectionReason}</p>
            </div>
          )}

          {/* Loading indicator */}
          {actionLoading && (
            <div className="flex items-center justify-center gap-3 py-4 text-purple-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Processing application, please wait...</span>
            </div>
          )}

          {/* Action Buttons */}
          {application.status !== 'approved' && application.status !== 'rejected' && (
            <div className="flex space-x-4 pt-4 border-t">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Approve Application</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                <span>Reject Application</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reject Application</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="Enter rejection reason..."
              disabled={actionLoading}
            />

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </span>
                ) : (
                  'Confirm Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetails;