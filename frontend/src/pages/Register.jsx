import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, Phone, Briefcase, ArrowRight } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'FLEET_MANAGER',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role === 'DRIVER') {
      // For drivers, we redirect them to the specialized driver registration
      toast.success('Redirecting to specialized Driver Onboarding...');
      navigate('/driver/register');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register(formData);
      toast.success(res.data?.message || 'Registration submitted successfully. Waiting for Super Admin approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfc] px-4 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#ff6b4a] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-[#047857] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-2000" />

      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e7e4e0] relative z-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-[#3d3a37] font-heading">
            Join FleetSphere
          </h2>
          <p className="mt-3 text-center text-sm text-[#78716c]">
            Submit your registration request for approval.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            <div className="relative">
              <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserPlus className="h-4 w-4 text-[#a8a29e]" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#e7e4e0] rounded-xl focus:ring-2 focus:ring-[#ff6b4a] focus:border-[#ff6b4a] bg-[#fafaf9] text-[#3d3a37] text-sm transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#a8a29e]" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#e7e4e0] rounded-xl focus:ring-2 focus:ring-[#ff6b4a] focus:border-[#ff6b4a] bg-[#fafaf9] text-[#3d3a37] text-sm transition-all"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-[#a8a29e]" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#e7e4e0] rounded-xl focus:ring-2 focus:ring-[#ff6b4a] focus:border-[#ff6b4a] bg-[#fafaf9] text-[#3d3a37] text-sm transition-all"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#a8a29e]" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#e7e4e0] rounded-xl focus:ring-2 focus:ring-[#ff6b4a] focus:border-[#ff6b4a] bg-[#fafaf9] text-[#3d3a37] text-sm transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-1.5">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-[#a8a29e]" />
                </div>
                <select
                  name="role"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#e7e4e0] rounded-xl focus:ring-2 focus:ring-[#ff6b4a] focus:border-[#ff6b4a] bg-[#fafaf9] text-[#3d3a37] text-sm transition-all"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="FLEET_MANAGER">Fleet Manager</option>
                  <option value="BRANCH_MANAGER">Branch Manager</option>
                  <option value="FINANCE_OFFICER">Finance Officer</option>
                  <option value="DRIVER">Driver</option>
                </select>
              </div>
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#ff6b4a] hover:bg-[#e65a3d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6b4a] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Request...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Submit Registration Request
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#78716c]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#ff6b4a] hover:text-[#e65a3d]">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
