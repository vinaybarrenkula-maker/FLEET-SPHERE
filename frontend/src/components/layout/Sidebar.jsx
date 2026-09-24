import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Truck, Users, MapPin, Route, Droplet, 
  Wrench, AlertTriangle, Receipt, FileText, Bell, Shield, X, 
  ExternalLink, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuthStore();
  const role = user?.role;

  const routes = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER','FINANCE_OFFICER','DRIVER'] },
    { name: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'] },
    { name: 'Drivers', path: '/drivers', icon: Users, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'] },
    { name: 'My Profile', path: '/profile', icon: Users, roles: ['DRIVER'] },
    { name: 'Routes', path: '/routes', icon: MapPin, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'] },
    { name: 'Trips', path: '/trips', icon: Route, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER','DRIVER'] },
    { name: 'Fuel Entries', path: '/fuel', icon: Droplet, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER','DRIVER'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'] },
    { name: 'Incidents', path: '/incidents', icon: AlertTriangle, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER','DRIVER'] },
    { name: 'Expenses', path: '/expenses', icon: Receipt, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER','FINANCE_OFFICER','DRIVER'] },
    { name: 'Documents', path: '/documents', icon: FileText, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'] },
    { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER','FINANCE_OFFICER','DRIVER'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: Shield, roles: ['SUPER_ADMIN','FLEET_MANAGER','BRANCH_MANAGER'] },
  ];

  const filteredRoutes = routes.filter(r => !r.roles || (role && r.roles.includes(role)));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e7e4e0]
        transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col shadow-xs
      `}>
        {/* Header / Brand */}
        <div className="h-17 flex items-center justify-between px-5 border-b border-[#e7e4e0] shrink-0 bg-[#fffdf9]">
          <Link to="/landing" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#ff6b4a] shadow-[0_4px_12px_rgba(255,107,74,0.3)] flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105">
              <Truck className="w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-lg text-[#3d3a37] tracking-tight">
              FleetSphere<span className="text-[#ff6b4a]">.ai</span>
            </span>
          </Link>
          <button 
            className="lg:hidden text-[#78716c] hover:text-[#3d3a37] p-1" 
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Showcase Link */}
        <div className="px-3 pt-3">
          <Link
            to="/landing"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#fff5f3] border border-[#ff6b4a]/20 text-[#b93f25] text-xs font-semibold hover:bg-[#ffece8] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ff6b4a]" />
              Explore Public Showcase
            </span>
            <ExternalLink className="w-3 h-3 text-[#ff6b4a]" />
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {filteredRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium
                ${isActive 
                  ? 'bg-[#fff5f3] text-[#b93f25] font-semibold border border-[#ff6b4a]/25 shadow-2xs' 
                  : 'text-[#78716c] hover:bg-[#fafaf9] hover:text-[#3d3a37]'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive 
                      ? 'bg-white text-[#ff6b4a] shadow-xs' 
                      : 'bg-[#fafaf9] text-[#78716c]'
                  }`}>
                    <route.icon className="w-4 h-4" />
                  </div>
                  <span>{route.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        
        {/* User Info footer in sidebar */}
        <div className="p-4 border-t border-[#e7e4e0] shrink-0 bg-[#fafaf9]">
          <div className="text-[11px] text-[#78716c] uppercase tracking-wider mb-2 font-bold font-heading">
            Current Session
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fff5f3] border border-[#ff6b4a]/30 text-[#b93f25] flex items-center justify-center text-xs font-bold font-heading">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#3d3a37] truncate">{user?.name || 'Authorized User'}</span>
              <span className="text-[11px] font-semibold text-[#ff6b4a] truncate">
                {user?.role ? user.role.replace('_', ' ') : 'DEMO USER'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
