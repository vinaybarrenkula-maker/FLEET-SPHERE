import React, { useEffect, useState } from 'react';
import { driverApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { User, Truck, Award, Phone, ShieldCheck, MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DriverProfile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await driverApi.getMyProfile();
        setProfile(data.data.driver);
      } catch (err) {
        toast.error('Could not load driver profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="w-10 h-10 border-4 border-[#ff6b4a]/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pg-card  rounded-2xl p-8 text-center pg-muted">
        <User className="w-12 h-12 mx-auto mb-3 pg-muted" />
        <h3 className="text-lg pg-heading">No Driver Profile Linked</h3>
        <p className="text-sm mt-1">Please contact your Fleet Manager to link an employee driver profile to your account.</p>
      </div>
    );
  }

  const isExpired = profile.licenseExpiry && new Date(profile.licenseExpiry) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl pg-heading flex items-center gap-2">
          <User className="w-6 h-6 text-[#ff6b4a]" />
          Driver Profile
        </h1>
        <p className="text-sm pg-muted mt-1">Personal details, assigned vehicle, and driving credentials</p>
      </div>

      {/* Top Banner Card */}
      <div className="pg-card  rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#fff5f3] border border-[#ff6b4a]/30 flex items-center justify-center text-[#ff6b4a] font-bold text-2xl shadow-inner">
              {profile.userId?.name ? profile.userId.name.charAt(0) : 'D'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{profile.userId?.name || user?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {profile.status}
                </span>
              </div>
              <p className="text-sm pg-muted">{profile.userId?.email || user?.email}</p>
              <p className="text-xs text-[#ff6b4a] font-mono mt-0.5">Emp ID: {profile.employeeId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <div className="pg-surface-2  p-3 rounded-xl  text-center min-w-[110px]">
              <span className="text-xs pg-muted font-medium block">Total Trips</span>
              <span className="text-lg font-bold text-white">{profile.totalTrips || 0}</span>
            </div>
            <div className="pg-surface-2  p-3 rounded-xl  text-center min-w-[110px]">
              <span className="text-xs pg-muted font-medium block">Total KM</span>
              <span className="text-lg font-bold text-[#ff6b4a]">{(profile.totalKm || 0).toLocaleString()} km</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driving License & Qualifications */}
        <div className="pg-card  rounded-2xl p-6 space-y-4">
          <h3 className="text-base pg-heading flex items-center gap-2 border-b pg-divider pb-3">
            <Award className="w-5 h-5 text-[#ff6b4a]" />
            Driving License & Documents
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b pg-divider/40">
              <span className="pg-muted">License Number</span>
              <span className="font-mono font-semibold text-white">{profile.licenseNumber}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b pg-divider/40">
              <span className="pg-muted">License Category</span>
              <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-medium text-xs">
                {profile.licenseType}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b pg-divider/40">
              <span className="pg-muted">License Expiry</span>
              <div className="flex items-center gap-1.5">
                {isExpired ? (
                  <span className="text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Expired ({new Date(profile.licenseExpiry).toLocaleDateString()})
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {profile.licenseExpiry ? new Date(profile.licenseExpiry).toLocaleDateString() : 'N/A'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="pg-muted">Branch Location</span>
              <span className="text-slate-200">{profile.branchId?.name || 'Hyderabad HQ'}</span>
            </div>
          </div>
        </div>

        {/* Currently Assigned Vehicle */}
        <div className="pg-card  rounded-2xl p-6 space-y-4">
          <h3 className="text-base pg-heading flex items-center gap-2 border-b pg-divider pb-3">
            <Truck className="w-5 h-5 text-[#ff6b4a]" />
            Assigned Vehicle
          </h3>

          {profile.assignedVehicle ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b pg-divider/40">
                <span className="pg-muted">Registration Number</span>
                <span className="font-mono font-bold text-[#ff6b4a] text-base">
                  {profile.assignedVehicle.registrationNumber}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b pg-divider/40">
                <span className="pg-muted">Model / Make</span>
                <span className="text-slate-200">
                  {profile.assignedVehicle.manufacturer} {profile.assignedVehicle.model}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b pg-divider/40">
                <span className="pg-muted">Vehicle Type</span>
                <span className="text-slate-200 capitalize">{profile.assignedVehicle.vehicleType?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="pg-muted">Current Odometer</span>
                <span className="font-mono text-slate-200">
                  {profile.assignedVehicle.currentMileage ? `${profile.assignedVehicle.currentMileage.toLocaleString()} km` : 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center pg-muted">
              <p className="text-sm">No vehicle assigned currently.</p>
              <p className="text-xs pg-muted mt-1">Vehicles are automatically allocated when you are assigned a scheduled trip.</p>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contact Information */}
      <div className="pg-card  rounded-2xl p-6">
        <h3 className="text-base pg-heading flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-[#ff6b4a]" />
          Emergency Contact Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="pg-surface-2  p-4 rounded-xl ">
            <span className="text-xs pg-muted block mb-1">Contact Name</span>
            <span className="font-medium text-white">{profile.emergencyContact?.name || 'Not provided'}</span>
          </div>
          <div className="pg-surface-2  p-4 rounded-xl ">
            <span className="text-xs pg-muted block mb-1">Phone Number</span>
            <span className="font-medium text-white">{profile.emergencyContact?.phone || 'Not provided'}</span>
          </div>
          <div className="pg-surface-2  p-4 rounded-xl ">
            <span className="text-xs pg-muted block mb-1">Relationship</span>
            <span className="font-medium text-white">{profile.emergencyContact?.relation || 'Family'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
