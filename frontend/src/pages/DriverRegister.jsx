import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Truck, ArrowLeft, ShieldCheck, User, Award, Building, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import toast from 'react-hot-toast';

const schema = z.object({
  // Personal Information
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),

  // Driver Information
  employeeId: z.string().min(2, 'Employee ID is required (e.g. EMP1001)'),
  licenseNumber: z.string().min(5, 'Valid driver license number is required'),
  licenseType: z.enum(['LMV', 'HMV', 'HGMV', 'MGV', 'PSV', 'HPMV'], {
    errorMap: () => ({ message: 'Please select a valid license category' }),
  }),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),

  // Emergency Contact
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  emergencyContactRelation: z.string().min(2, 'Relationship is required (e.g. Spouse, Father)'),

  // Organization Information
  organizationId: z.string().min(1, 'Please select your organization'),
  branchId: z.string().min(1, 'Please select your operating branch'),

  // Optional
  profilePhoto: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const DriverRegister = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orgData, setOrgData] = useState({ organizations: [], branches: [] });
  const [loadingOrgData, setLoadingOrgData] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      licenseType: 'HMV',
      emergencyContactRelation: 'Spouse',
    },
  });

  const selectedOrgId = watch('organizationId');

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const { data } = await authApi.getOrgBranches();
        const orgs = data.data.organizations || [];
        const branches = data.data.branches || [];
        setOrgData({ organizations: orgs, branches });

        if (orgs.length > 0) {
          setValue('organizationId', orgs[0]._id);
          const firstBranches = branches.filter((b) => String(b.organizationId) === String(orgs[0]._id));
          if (firstBranches.length > 0) {
            setValue('branchId', firstBranches[0]._id);
          }
        }
      } catch (err) {
        toast.error('Could not load organizations. Using default.');
      } finally {
        setLoadingOrgData(false);
      }
    };
    fetchOrgs();
  }, [setValue]);

  // Filter branches based on selected org
  const filteredBranches = orgData.branches.filter(
    (b) => !selectedOrgId || String(b.organizationId) === String(selectedOrgId)
  );

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Backend strictly forces role = 'DRIVER'
      await authApi.registerDriver(data);
      toast.success('Driver account created successfully.\nPlease login to continue.', {
        duration: 5000,
      });
      // Navigate to login with DRIVER preselected
      navigate('/login', { state: { preselectedRole: 'DRIVER' } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="pg-card w-full max-w-3xl  overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b pg-divider bg-slate-850/60">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold pg-muted hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl pg-heading tracking-tight">Driver Registration</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-[#ff6b4a] border border-[#ff6b4a]/30">
                  Role: DRIVER
                </span>
              </div>
              <p className="text-xs sm:text-sm pg-muted mt-0.5">
                Join the fleet. Register your commercial driving credentials to start receiving assigned trips.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#ff6b4a] uppercase tracking-wider flex items-center gap-2 border-b pg-divider pb-2">
              <User className="w-4 h-4" />
              1. Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="e.g. Ramesh Yadav"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="driver@fleetsphere.demo"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (10 Digits) *</label>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="9876543210"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Profile Photo URL (Optional)</label>
                <input
                  {...register('profilePhoto')}
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password *</label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Driver & License Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#ff6b4a] uppercase tracking-wider flex items-center gap-2 border-b pg-divider pb-2">
              <Award className="w-4 h-4" />
              2. Commercial Driver Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Employee ID *</label>
                <input
                  {...register('employeeId')}
                  type="text"
                  placeholder="e.g. EMP0088"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                {errors.employeeId && <p className="text-xs text-rose-400 mt-1">{errors.employeeId.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">License Number *</label>
                <input
                  {...register('licenseNumber')}
                  type="text"
                  placeholder="e.g. TS20230009988"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                {errors.licenseNumber && (
                  <p className="text-xs text-rose-400 mt-1">{errors.licenseNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">License Type *</label>
                <select
                  {...register('licenseType')}
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                  <option value="HGMV">HGMV (Heavy Goods Motor Vehicle)</option>
                  <option value="LMV">LMV (Light Motor Vehicle)</option>
                  <option value="MGV">MGV (Medium Goods Vehicle)</option>
                  <option value="PSV">PSV (Public Service Vehicle)</option>
                  <option value="HPMV">HPMV (Heavy Passenger Motor Vehicle)</option>
                </select>
                {errors.licenseType && <p className="text-xs text-rose-400 mt-1">{errors.licenseType.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">License Expiry Date *</label>
                <input
                  {...register('licenseExpiry')}
                  type="date"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.licenseExpiry && (
                  <p className="text-xs text-rose-400 mt-1">{errors.licenseExpiry.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#ff6b4a] uppercase tracking-wider flex items-center gap-2 border-b pg-divider pb-2">
              <ShieldCheck className="w-4 h-4" />
              3. Emergency Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Name *</label>
                <input
                  {...register('emergencyContactName')}
                  type="text"
                  placeholder="e.g. Kavitha Yadav"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.emergencyContactName && (
                  <p className="text-xs text-rose-400 mt-1">{errors.emergencyContactName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Emergency Phone *</label>
                <input
                  {...register('emergencyContactPhone')}
                  type="tel"
                  placeholder="9876500000"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.emergencyContactPhone && (
                  <p className="text-xs text-rose-400 mt-1">{errors.emergencyContactPhone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Relationship *</label>
                <input
                  {...register('emergencyContactRelation')}
                  type="text"
                  placeholder="e.g. Spouse / Brother"
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.emergencyContactRelation && (
                  <p className="text-xs text-rose-400 mt-1">{errors.emergencyContactRelation.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Organization & Operating Branch */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#ff6b4a] uppercase tracking-wider flex items-center gap-2 border-b pg-divider pb-2">
              <Building className="w-4 h-4" />
              4. Company & Base Branch
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Organization *</label>
                <select
                  {...register('organizationId')}
                  disabled={loadingOrgData}
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {orgData.organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name} ({org.companyCode})
                    </option>
                  ))}
                </select>
                {errors.organizationId && (
                  <p className="text-xs text-rose-400 mt-1">{errors.organizationId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Operating Branch *</label>
                <select
                  {...register('branchId')}
                  disabled={loadingOrgData}
                  className="pg-input w-full px-3.5 py-2.5   text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {filteredBranches.map((br) => (
                    <option key={br._id} value={br._id}>
                      {br.name} ({br.city || br.branchCode})
                    </option>
                  ))}
                </select>
                {errors.branchId && <p className="text-xs text-rose-400 mt-1">{errors.branchId.message}</p>}
              </div>
            </div>
          </div>

          {/* Role Enforcement Notice */}
          <div className="p-4 bg-[#fff5f3] border border-[#ff6b4a]/20 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#ff6b4a] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Security & Role Notice:</span> Submitting this registration
              form will automatically establish an authorized <span className="text-[#ff6b4a] font-semibold">DRIVER</span> account.
              Administrative roles (Super Admin, Fleet Manager, Branch Manager, Finance Officer) cannot self-register and
              must be provisioned by an administrator.
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t pg-divider">
            <Link
              to="/login"
              className="text-xs pg-muted hover:text-white transition-colors"
            >
              Already registered as a driver? <span className="text-[#ff6b4a] font-medium">Log in here</span>
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  Complete Driver Registration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverRegister;
