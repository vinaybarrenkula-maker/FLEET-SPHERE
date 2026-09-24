import React from 'react';
import { Menu, LogOut, User as UserIcon, Shield, Radio, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="h-17 bg-[#fffdf9]/90 backdrop-blur-md border-b border-[#e7e4e0] flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-[#78716c] hover:text-[#3d3a37] lg:hidden rounded-lg hover:bg-[#fafaf9]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="badge-mint">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            Telemetry Stream Active
          </span>
          <span className="text-xs text-[#78716c]">
            HQ Dispatch Console
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link 
          to="/landing"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#b93f25] bg-[#fff5f3] hover:bg-[#ffece8] border border-[#ff6b4a]/25 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ff6b4a]" />
          <span>Product Showcase</span>
        </Link>

        {/* User Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#e7e4e0] shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-[#fff5f3] text-[#b93f25] flex items-center justify-center font-bold text-xs font-heading">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-[#3d3a37] leading-tight truncate max-w-[130px]">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] font-semibold text-[#78716c] uppercase">
              {user?.role ? user.role.replace('_', ' ') : 'DEMO'}
            </span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#78716c] hover:text-[#c24127] p-2 sm:px-3 sm:py-1.5 rounded-xl hover:bg-[#fff5f3] border border-transparent hover:border-[#ff6b4a]/20 transition-all cursor-pointer"
          title="Sign out of console"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
