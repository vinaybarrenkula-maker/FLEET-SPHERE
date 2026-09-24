import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Truck, LogIn, Check, ArrowRight, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const ROLES = [
  {
    id: 'SUPER_ADMIN',
    name: 'Super Admin',
    emoji: '👑',
    description: 'System administration & tenant control',
  },
  {
    id: 'FLEET_MANAGER',
    name: 'Fleet Manager',
    emoji: '🚛',
    description: 'Fleet allocations, tracking & routes',
  },
  {
    id: 'BRANCH_MANAGER',
    name: 'Branch Manager',
    emoji: '🏢',
    description: 'Branch ops, vehicles & local crew',
  },
  {
    id: 'FINANCE_OFFICER',
    name: 'Finance Officer',
    emoji: '💰',
    description: 'Expense approvals & cost audit',
  },
  {
    id: 'DRIVER',
    name: 'Driver',
    emoji: '👨‍✈️',
    description: 'Trip navigation, fuel logs & claims',
  },
];

const ROLE_REDIRECTS = {
  SUPER_ADMIN: '/dashboard/admin',
  FLEET_MANAGER: '/dashboard/fleet',
  BRANCH_MANAGER: '/dashboard/branch',
  DRIVER: '/dashboard/driver',
  FINANCE_OFFICER: '/dashboard/finance',
};

const Login = () => {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected role state (defaults to preselected from navigation, or SUPER_ADMIN)
  const [selectedRole, setSelectedRole] = useState(
    location.state?.preselectedRole || 'SUPER_ADMIN'
  );
  const [demoCredsOpen, setDemoCredsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (location.state?.preselectedRole) {
      setSelectedRole(location.state.preselectedRole);
    }
  }, [location.state]);

  const onSubmit = async (data) => {
    try {
      const response = await login({
        email: data.email,
        password: data.password,
        selectedRole,
      });

      toast.success('Login successful!');
      const userRole = response?.data?.user?.role || selectedRole;
      const redirectUrl = ROLE_REDIRECTS[userRole] || '/dashboard';
      navigate(redirectUrl);
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    }
  };

  const setDemoAccount = (roleId, email) => {
    setSelectedRole(roleId);
    setValue('email', email);
    setValue('password', 'Demo@12345');
  };

  return (
    <div className="min-h-screen bg-[#fffdf9] text-[#3d3a37] hero-wash py-10 px-4 sm:px-6 flex flex-col items-center justify-center font-sans selection:bg-[#ff6b4a]/20 selection:text-[#c24127]">
      {/* Return to Showcase Link */}
      <div className="w-full max-w-xl mb-4 flex justify-between items-center text-xs font-semibold">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[#78716c] hover:text-[#ff6b4a] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>
        <span className="badge-mint">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
          AIS-140 Secure Server
        </span>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-[0_16px_50px_rgba(61,58,55,0.08)] border border-[#e7e4e0] overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 text-center border-b border-[#e7e4e0] bg-[#fafaf9]/70 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#ff6b4a] rounded-2xl shadow-[0_8px_20px_rgba(255,107,74,0.35)] mb-3">
            <Truck className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#3d3a37] tracking-tight">
            Sign In to FleetSphere
          </h1>
          <p className="text-xs sm:text-sm text-[#78716c] mt-1 font-normal">
            Autonomous Fleet Intelligence & Command Platform
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Section: Role Selection Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#78716c] font-heading">
                SELECT PORTAL ROLE
              </span>
              <span className="text-xs text-[#ff6b4a] font-semibold">
                Access configured permissions
              </span>
            </div>

            {/* Grid of 5 Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.slice(0, 4).map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`
                      relative p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer
                      flex items-center justify-between
                      ${
                        isSelected
                          ? 'bg-[#fff5f3] border-[#ff6b4a] shadow-xs ring-1 ring-[#ff6b4a]'
                          : 'bg-[#fafaf9] border-[#e7e4e0] hover:border-[#ff6b4a]/40 hover:bg-[#fff5f3]/40 text-[#78716c]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0">{role.emoji}</span>
                      <div>
                        <div className={`font-semibold text-sm ${isSelected ? 'text-[#3d3a37]' : 'text-[#78716c]'}`}>
                          {role.name}
                        </div>
                        <div className="text-[11px] text-[#78716c] mt-0.5 truncate max-w-[140px]">
                          {role.description}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`
                        w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors
                        ${isSelected ? 'bg-[#ff6b4a] text-white shadow-2xs' : 'border border-[#d6d3d1] bg-white'}
                      `}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}

              {/* Driver Card: Centered / Spans 2 columns on desktop */}
              <div className="sm:col-span-2">
                {(() => {
                  const driverRole = ROLES[4];
                  const isSelected = selectedRole === driverRole.id;
                  return (
                    <button
                      type="button"
                      onClick={() => setSelectedRole(driverRole.id)}
                      className={`
                        w-full relative p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer
                        flex items-center justify-between
                        ${
                          isSelected
                            ? 'bg-[#fff5f3] border-[#ff6b4a] shadow-xs ring-1 ring-[#ff6b4a]'
                            : 'bg-[#fafaf9] border-[#e7e4e0] hover:border-[#ff6b4a]/40 hover:bg-[#fff5f3]/40 text-[#78716c]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl shrink-0">{driverRole.emoji}</span>
                        <div>
                          <div className={`font-semibold text-sm ${isSelected ? 'text-[#3d3a37]' : 'text-[#78716c]'}`}>
                            {driverRole.name} (Mobile Operator Console)
                          </div>
                          <div className="text-[11px] text-[#78716c] mt-0.5">
                            {driverRole.description}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`
                          w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors
                          ${isSelected ? 'bg-[#ff6b4a] text-white shadow-2xs' : 'border border-[#d6d3d1] bg-white'}
                        `}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Section: Email & Password Credentials Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#3d3a37] mb-1.5">
                Official Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="name@fleetsphere.demo"
                className="w-full px-4 py-2.5 bg-white border border-[#e7e4e0] rounded-xl text-sm text-[#3d3a37] placeholder-[#a8a29e] focus:outline-hidden focus:border-[#ff6b4a] focus:ring-2 focus:ring-[#ff6b4a]/20 transition-all"
              />
              {errors.email && <p className="text-xs text-[#be123c] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#3d3a37]">
                  Account Password
                </label>
                <span className="text-[11px] text-[#ff6b4a] cursor-pointer hover:underline">
                  Forgot?
                </span>
              </div>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white border border-[#e7e4e0] rounded-xl text-sm text-[#3d3a37] placeholder-[#a8a29e] focus:outline-hidden focus:border-[#ff6b4a] focus:ring-2 focus:ring-[#ff6b4a]/20 transition-all"
              />
              {errors.password && <p className="text-xs text-[#be123c] mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-coral w-full py-3 px-4 text-sm mt-3 shadow-[0_8px_20px_rgba(255,107,74,0.3)] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In as {ROLES.find((r) => r.id === selectedRole)?.name}
                </>
              )}
            </button>
          </form>

          {/* Driver Registration Link */}
          <div className="border-t border-[#e7e4e0] pt-4 text-center">
            <p className="text-xs text-[#78716c]">Joining as a new commercial driver?</p>
            <Link
              to="/driver/register"
              className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#b93f25] hover:text-[#ff6b4a] transition-colors"
            >
              Driver Verification & Onboarding Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Demo Credentials Helper */}
        <div className="bg-[#fafaf9] p-4 border-t border-[#e7e4e0]">
          <button
            type="button"
            onClick={() => setDemoCredsOpen(!demoCredsOpen)}
            className="text-xs text-[#ff6b4a] hover:text-[#c24127] font-semibold flex items-center justify-center w-full gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{demoCredsOpen ? 'Hide Quick Demo Credentials' : '⚡ Quick Autofill Demo Credentials'}</span>
          </button>

          {demoCredsOpen && (
            <div className="mt-3 space-y-2 text-xs">
              <p className="text-[#78716c] text-center mb-2">
                Universal Demo Password: <code className="bg-white px-2 py-0.5 border border-[#e7e4e0] rounded text-[#b93f25] font-bold">Demo@12345</code>
              </p>
              {[
                { r: 'Super Admin', id: 'SUPER_ADMIN', e: 'admin@fleetsphere.demo' },
                { r: 'Fleet Manager', id: 'FLEET_MANAGER', e: 'manager@fleetsphere.demo' },
                { r: 'Branch Manager', id: 'BRANCH_MANAGER', e: 'branch@fleetsphere.demo' },
                { r: 'Finance Officer', id: 'FINANCE_OFFICER', e: 'finance@fleetsphere.demo' },
                { r: 'Driver', id: 'DRIVER', e: 'driver@fleetsphere.demo' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDemoAccount(d.id, d.e)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-[#fff5f3] text-[#3d3a37] border border-[#e7e4e0] hover:border-[#ff6b4a]/30 flex justify-between items-center transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-xs text-[#3d3a37]">{d.r}</span>
                  <span className="font-mono text-[11px] text-[#ff6b4a] font-medium">{d.e}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
