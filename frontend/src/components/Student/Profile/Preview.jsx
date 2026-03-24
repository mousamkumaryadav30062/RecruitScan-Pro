import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  User,
  FileText,
  MapPin,
  GraduationCap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const Preview = ({ onPrevious }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL.replace('/api', '');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/user/profile');
      setProfile(data);
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.put('/user/profile/complete');
      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-600 text-lg">Loading profile preview...</p>
      </div>
    );
  }

  const InfoItem = ({ label, value }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-800 break-words">{value || '-'}</p>
    </div>
  );

  const DocumentImageCard = ({ title, file, alt }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-700 mb-3">{title}</p>
      <div className="flex items-center justify-center bg-gray-50 rounded-xl p-3 min-h-[180px]">
        <img
          src={`${API_URL}/uploads/${file}`}
          alt={alt}
          className="max-h-44 w-auto object-contain rounded-lg border"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Profile Preview</h2>
            <p className="text-blue-100 mt-2 text-sm md:text-base">
              Please review all details carefully before completing your profile.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4">
            <p className="text-sm text-blue-100">Applicant</p>
            <p className="text-lg font-semibold">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-sm text-blue-100 mt-1">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-blue-50 flex items-center gap-3">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <InfoItem label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
          <InfoItem label="Email" value={profile.email} />
          <InfoItem label="Mobile" value={profile.mobile} />
          <InfoItem label="Gender" value={profile.gender} />
          <InfoItem
            label="Date of Birth (A.D.)"
            value={profile.dobAD ? new Date(profile.dobAD).toLocaleDateString('en-CA') : ''}
          />
          <InfoItem label="Citizenship Number" value={profile.citizenship} />
          {profile.fatherName && <InfoItem label="Father's Name" value={profile.fatherName} />}
          {profile.motherName && <InfoItem label="Mother's Name" value={profile.motherName} />}
          {profile.grandFatherName && (
            <InfoItem label="Grandfather's Name" value={profile.grandFatherName} />
          )}
        </div>
      </section>

      {/* Uploaded Documents */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-purple-50 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Uploaded Documents</h3>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {profile.photo && (
            <DocumentImageCard
              title="PP Size Photo"
              file={profile.photo}
              alt="Photo"
            />
          )}

          {profile.signature && (
            <DocumentImageCard
              title="Signature"
              file={profile.signature}
              alt="Signature"
            />
          )}

          {profile.citizenshipFront && (
            <DocumentImageCard
              title="Citizenship Front"
              file={profile.citizenshipFront}
              alt="Citizenship Front"
            />
          )}

          {profile.citizenshipBack && (
            <DocumentImageCard
              title="Citizenship Back"
              file={profile.citizenshipBack}
              alt="Citizenship Back"
            />
          )}
        </div>
      </section>

      {/* Address Information */}
      {profile.permanentAddress && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-green-50 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Address Information</h3>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h4 className="font-semibold text-gray-800 mb-3">Permanent Address</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">Province:</span> {profile.permanentAddress.province || '-'}</p>
                <p><span className="font-medium">District:</span> {profile.permanentAddress.district || '-'}</p>
                <p><span className="font-medium">Local Body:</span> {profile.permanentAddress.localBody || '-'}</p>
                <p><span className="font-medium">Ward No:</span> {profile.permanentAddress.wardNo || '-'}</p>
                <p><span className="font-medium">Tole:</span> {profile.permanentAddress.tole || '-'}</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h4 className="font-semibold text-gray-800 mb-3">Temporary Address</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">Province:</span> {profile.temporaryAddress?.province || '-'}</p>
                <p><span className="font-medium">District:</span> {profile.temporaryAddress?.district || '-'}</p>
                <p><span className="font-medium">Local Body:</span> {profile.temporaryAddress?.localBody || '-'}</p>
                <p><span className="font-medium">Ward No:</span> {profile.temporaryAddress?.wardNo || '-'}</p>
                <p><span className="font-medium">Tole:</span> {profile.temporaryAddress?.tole || '-'}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Additional Details */}
      {(profile.quota || profile.caste || profile.religion || profile.employmentStatus) && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-yellow-50 flex items-center gap-3">
            <FileText className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-800">Additional Details</h3>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {profile.quota && <InfoItem label="Quota" value={profile.quota} />}
            {profile.caste && <InfoItem label="Caste" value={profile.caste} />}
            {profile.religion && <InfoItem label="Religion" value={profile.religion} />}
            {profile.employmentStatus && (
              <InfoItem label="Employment Status" value={profile.employmentStatus} />
            )}
          </div>
        </section>
      )}

      {/* Education Details */}
      {profile.education && profile.education.length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-pink-50 flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Education Details ({profile.education.length})
            </h3>
          </div>

          <div className="p-6 space-y-5">
            {profile.education.map((edu, index) => (
              <div
                key={edu._id || index}
                className="border border-gray-200 rounded-2xl bg-gray-50 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {edu.level} - {edu.university}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Country: {edu.country || '-'}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 text-sm font-medium w-fit">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Education Record</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Level" value={edu.level} />
                    <InfoItem label="Country" value={edu.country} />
                    <InfoItem label="University / Board" value={edu.university} />
                    <InfoItem label="GPA / Percentage" value={edu.gpaPercentage || '-'} />
                    <InfoItem label="Grade / Division" value={edu.gradeDivision || '-'} />
                  </div>

                  {edu.documents && edu.documents.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <p className="font-medium text-gray-800 mb-3">Uploaded Education Documents</p>

                      <div className="flex flex-wrap gap-3">
                        {edu.documents.map((doc, docIndex) => (
                          <a
                            key={docIndex}
                            href={`${API_URL}/uploads/${doc.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                          >
                            <Download className="w-4 h-4" />
                            <span>{doc.docType || 'Document'}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
        <button
          onClick={onPrevious}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
        >
          Previous
        </button>

        <button
          onClick={handleComplete}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition font-medium"
        >
          {loading ? 'Completing...' : 'Complete Profile'}
        </button>
      </div>
    </div>
  );
};

export default Preview;