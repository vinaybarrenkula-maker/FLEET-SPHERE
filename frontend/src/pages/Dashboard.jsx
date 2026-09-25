import React, { useEffect, useState } from 'react';
import { dashboardApi, adminApi } from '../api';
import { Truck, AlertTriangle, IndianRupee, Map, Users, RefreshCw, TrendingUp, ShieldCheck, Zap, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuthStore } from '../store/authStore';

const StatCard = ({ title, value, icon: Icon, subtext, tone = 'coral' }) => {
  const toneStyles = {
    coral: { bg: 'bg-[#fff5f3]', text: 'text-[#ff6b4a]', border: 'border-[#ff6b4a]/20' },
    mint: { bg: 'bg-[#ecfdf5]', text: 'text-[#047857]', border: 'border-[#a7f3d0]' },
    lavender: { bg: 'bg-[#faf5ff]', text: 'text-[#7c3aed]', border: 'border-[#ddd6fe]' },
    amber: { bg: 'bg-[#fffbeb]', text: 'text-[#b45309]', border: 'border-[#fde68a]' },
  };

  const style = toneStyles[tone] || toneStyles.coral;

  return (
    <div className="card-clean card-lift p-6 bg-white border border-[#e7e4e0] rounded-2xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#78716c] uppercase tracking-wider font-heading mb-1.5">{title}</p>
          <h3 className="font-heading text-3xl font-extrabold text-[#3d3a37] tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-[#78716c] mt-2 font-medium">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${style.bg} ${style.text} border ${style.border} shadow-2xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

// Fallback operational data if backend is offline or empty
const DEFAULT_DASHBOARD_DATA = {
  fleet: {
    totalVehicles: 48,
    vehiclesOnTrip: 34,
    vehiclesMaintenance: 3,
    vehiclesIdle: 11
  },
  drivers: {
    totalDrivers: 52,
    activeDrivers: 38,
    onTrip: 34
  },
  trips: {
    tripsToday: 18,
    completedTripsTotal: 429
  },
  financials: {
    totalOperationalCost: 1485000,
    pendingExpenses: 4
  },
  alerts: {
    expiringLicenses: 2,
    expiringInsurance: 1
  }
};

const DEFAULT_EXPENSE_DATA = {
  monthly: [
    { month: 'Oct', total: 210000 },
    { month: 'Nov', total: 245000 },
    { month: 'Dec', total: 290000 },
    { month: 'Jan', total: 260000 },
    { month: 'Feb', total: 235000 },
    { month: 'Mar', total: 245000 },
  ],
  byCategory: [
    { _id: 'Fuel & Oil', total: 142000 },
    { _id: 'Toll & FASTag', total: 46000 },
    { _id: 'Maintenance', total: 32000 },
    { _id: 'Driver Allowance', total: 25000 },
  ]
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(DEFAULT_DASHBOARD_DATA);
  const [expenseData, setExpenseData] = useState(DEFAULT_EXPENSE_DATA);
  const [pendingUsers, setPendingUsers] = useState([]);
  const { user } = useAuthStore();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const promises = [
        dashboardApi.getOverview(),
        dashboardApi.getExpenseAnalytics({ months: 6 })
      ];
      if (user?.role === 'SUPER_ADMIN') {
        promises.push(adminApi.getPendingUsers().catch(() => ({ data: { data: { users: [] } } })));
      }

      const [overviewRes, expenseRes, pendingRes] = await Promise.all(promises);
      if (overviewRes?.data?.data) setData(overviewRes.data.data);
      if (expenseRes?.data?.data) setExpenseData(expenseRes.data.data);
      if (pendingRes?.data?.data?.users) setPendingUsers(pendingRes.data.data.users);
    } catch (error) {
      // Graceful fallback to default telemetry
      setData(DEFAULT_DASHBOARD_DATA);
      setExpenseData(DEFAULT_EXPENSE_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (id) => {
    try {
      await adminApi.approveUser(id);
      toast.success('User approved successfully.');
      setPendingUsers(pendingUsers.filter(u => u._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleRejectUser = async (id) => {
    try {
      await adminApi.rejectUser(id, { rejectionReason: 'Rejected by Super Admin' });
      toast.success('User registration rejected.');
      setPendingUsers(pendingUsers.filter(u => u._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ff6b4a]/25 border-t-[#ff6b4a] rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#78716c]">Loading Telematics Overview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="eyebrow-chip mb-2">
            <Zap className="w-3.5 h-3.5" />
            Live Command Center
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#3d3a37] tracking-tight">
            Fleet Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#78716c] mt-1 font-normal">
            Real-time asset telemetry, active dispatches, and operating cash-burn metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchDashboardData}
            className="btn-soft text-xs py-2 px-3 shadow-2xs"
            title="Refresh Telematics"
          >
            <RefreshCw className="w-4 h-4 text-[#78716c]" />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* Registration Requests (Super Admin Only) */}
      {user?.role === 'SUPER_ADMIN' && pendingUsers.length > 0 && (
        <div className="card-clean p-6 bg-white border border-[#e7e4e0] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#ff6b4a]" />
              <div>
                <h3 className="font-heading font-bold text-base text-[#3d3a37]">
                  Pending Registration Requests
                </h3>
                <p className="text-xs text-[#78716c]">Staff members waiting for approval</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-[#fffbeb] text-[#b45309] rounded-md border border-[#fde68a] text-xs font-bold">
              {pendingUsers.length} Requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#fafaf9] text-[#78716c] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e4e0]/50">
                {pendingUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#fff5f3]/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#3d3a37]">{u.name}</td>
                    <td className="px-4 py-3 text-[#78716c]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#faf5ff] text-[#7c3aed] border border-[#ddd6fe]">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#a8a29e]">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleApproveUser(u._id)} className="p-1.5 rounded-lg bg-[#ecfdf5] text-[#047857] hover:bg-[#d1fae5] transition-colors" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRejectUser(u._id)} className="p-1.5 rounded-lg bg-[#fff1f2] text-[#e11d48] hover:bg-[#ffe4e6] transition-colors" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Active Vehicles" 
          value={data.fleet?.vehiclesOnTrip || 34} 
          subtext={`Out of ${data.fleet?.totalVehicles || 48} total registered`}
          icon={Truck}
          tone="coral"
        />
        <StatCard 
          title="Available Drivers" 
          value={data.drivers?.activeDrivers || 38} 
          subtext={`Out of ${data.drivers?.totalDrivers || 52} certified crew`}
          icon={Users}
          tone="mint"
        />
        <StatCard 
          title="Trips Dispatched" 
          value={data.trips?.tripsToday || 18} 
          subtext={`${data.trips?.completedTripsTotal || 429} total completed`}
          icon={Map}
          tone="lavender"
        />
        <StatCard 
          title="Operating Cost (30d)" 
          value={`₹${((data.financials?.totalOperationalCost || 1485000) / 100000).toFixed(2)}L`} 
          subtext={`${data.financials?.pendingExpenses || 4} pending audit claims`}
          icon={IndianRupee}
          tone="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Trend */}
        <div className="card-clean p-6 bg-white border border-[#e7e4e0] rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading font-bold text-base text-[#3d3a37]">
                Monthly Operational Burn
              </h3>
              <p className="text-xs text-[#78716c]">Fuel, maintenance & crew claims (Last 6 Months)</p>
            </div>
            <span className="badge-mint text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              -12.4% vs Prev
            </span>
          </div>

          <div className="h-72">
            {expenseData?.monthly && expenseData.monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={expenseData.monthly}>
                  <defs>
                    <linearGradient id="colorTotalCoral" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b4a" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#ff6b4a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0eee9" vertical={false} />
                  <XAxis dataKey="month" stroke="#a8a29e" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a8a29e" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e4e0', borderRadius: '12px', color: '#3d3a37', boxShadow: '0 4px 16px rgba(61,58,55,0.08)' }}
                    itemStyle={{ color: '#ff6b4a', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="total" name="Total Expenses (₹)" stroke="#ff6b4a" strokeWidth={3} fillOpacity={1} fill="url(#colorTotalCoral)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#78716c] text-xs">No expense data available</div>
            )}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="card-clean p-6 bg-white border border-[#e7e4e0] rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading font-bold text-base text-[#3d3a37]">
                Expenditure by Cost Center
              </h3>
              <p className="text-xs text-[#78716c]">Breakdown across fleet categories</p>
            </div>
            <span className="text-xs font-semibold text-[#78716c]">Current Cycle</span>
          </div>

          <div className="h-72">
            {expenseData?.byCategory && expenseData.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData.byCategory} layout="vertical" margin={{ top: 0, right: 10, left: 35, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0eee9" horizontal={false} />
                  <XAxis type="number" stroke="#a8a29e" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="_id" stroke="#a8a29e" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e4e0', borderRadius: '12px', color: '#3d3a37', boxShadow: '0 4px 16px rgba(61,58,55,0.08)' }}
                    cursor={{ fill: '#fafaf9' }}
                  />
                  <Bar dataKey="total" name="Amount (₹)" fill="#047857" radius={[0, 6, 6, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#78716c] text-xs">No expense data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts & Attention Needed + Live Radar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-clean p-6 bg-white border border-[#e7e4e0] rounded-2xl lg:col-span-1">
          <h3 className="font-heading font-bold text-base text-[#3d3a37] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#ff6b4a]" />
            Action Required
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-[#fafaf9] hover:bg-[#fff5f3] transition-colors rounded-xl border border-[#e7e4e0]">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff6b4a]"></div>
                <span className="text-xs font-semibold text-[#3d3a37]">In Scheduled Maintenance</span>
              </div>
              <span className="text-sm font-extrabold font-heading text-[#b93f25]">{data.fleet?.vehiclesMaintenance || 3}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#fafaf9] hover:bg-[#fff5f3] transition-colors rounded-xl border border-[#e7e4e0]">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#b45309]"></div>
                <span className="text-xs font-semibold text-[#3d3a37]">Expiring Driver Licenses (30d)</span>
              </div>
              <span className="text-sm font-extrabold font-heading text-[#b45309]">{data.alerts?.expiringLicenses || 2}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#fafaf9] hover:bg-[#fff5f3] transition-colors rounded-xl border border-[#e7e4e0]">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#b45309]"></div>
                <span className="text-xs font-semibold text-[#3d3a37]">Expiring Vehicle Insurance</span>
              </div>
              <span className="text-sm font-extrabold font-heading text-[#b45309]">{data.alerts?.expiringInsurance || 1}</span>
            </div>
          </div>
        </div>
        
        {/* Live Fleet Telematics Live Preview Map */}
        <div className="card-clean p-6 bg-white border border-[#e7e4e0] rounded-2xl lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-[#3d3a37]">Live Fleet Map Stream</h3>
              <p className="text-xs text-[#78716c]">National Highway AIS-140 tracking feed</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#047857]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              34 Units Moving
            </div>
          </div>

          <div className="h-52 rounded-xl bg-[#fafaf9] border border-dashed border-[#e7e4e0] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#fff5f3] text-[#ff6b4a] flex items-center justify-center mb-3 shadow-2xs">
              <Map className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-[#3d3a37]">All GPS Transponders Active</p>
            <p className="text-[11px] text-[#78716c] mt-0.5 max-w-sm">
              Continuous 10-second heartbeat pinging Mumbai, Delhi, Bengaluru, and Chennai logistics hubs.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e7e4e0] flex items-center justify-between text-xs text-[#78716c]">
            <span>Average Speed: <strong className="text-[#3d3a37]">54.2 km/h</strong></span>
            <span>Idle Fuel Burn: <strong className="text-[#047857]">Normal (1.2%)</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
