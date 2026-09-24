import React, { useEffect, useState } from 'react';
import { driverApi, downloadCSV } from '../api';
import { useAuthStore } from '../store/authStore';
import { Users, Search, Download, Plus, Phone, Award, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const Drivers = () => {
  const { user } = useAuthStore();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchDrivers = async (currentPage = 1) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const { data } = await driverApi.getAll(params);
      setDrivers(data.data);
      setTotalPages(data.pagination.totalPages || 1);
      setPage(data.pagination.page || 1);
    } catch (err) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers(1);
  }, [search, statusFilter]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await driverApi.export({ status: statusFilter });
      downloadCSV(res, 'drivers-roster.csv');
      toast.success('Driver roster exported');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const statusColors = {
    AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    ASSIGNED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    ON_TRIP: 'bg-[#fff5f3] text-[#ff6b4a] border-[#ff6b4a]/30 font-semibold',
    ON_LEAVE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    INACTIVE: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl pg-heading flex items-center gap-2">
            <Users className="w-6 h-6 text-[#ff6b4a]" />
            Drivers Directory
          </h1>
          <p className="text-sm pg-muted mt-1">Commercial driver assignments, licensing compliance, and trip statistics</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="pg-card px-3.5 py-2 rounded-lg  font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
        {['', 'AVAILABLE', 'ASSIGNED', 'ON_TRIP', 'ON_LEAVE', 'INACTIVE'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {st === '' ? 'ALL DRIVERS' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="pg-card  shadow-sm overflow-hidden flex flex-col">
        {/* Search */}
        <div className="p-4 border-b pg-divider bg-slate-800/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pg-muted" />
            <input
              type="text"
              placeholder="Search driver by name, license #, or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pg-select w-full pl-9 pr-4 py-2  g text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs pg-muted uppercase bg-slate-900/50 border-b pg-divider">
              <tr>
                <th className="px-6 py-4 font-semibold">Driver Name & ID</th>
                <th className="px-6 py-4 font-semibold">License Info</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Assigned Vehicle</th>
                <th className="px-6 py-4 font-semibold">Trips / KM</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center pg-muted">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#ff6b4a]/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                    Loading driver records...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center pg-muted">
                    No drivers found.
                  </td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{d.userId?.name || 'Driver'}</div>
                      <div className="text-xs pg-muted font-mono">{d.employeeId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-slate-200 text-xs font-semibold">{d.licenseNumber}</div>
                      <div className="text-xs pg-muted">Class: {d.licenseType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-200 font-mono text-xs">{d.phone || d.userId?.phone}</div>
                      <div className="text-xs pg-muted">{d.userId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {d.assignedVehicle ? (
                        <div className="font-mono text-[#ff6b4a] font-semibold text-xs">
                          {d.assignedVehicle.registrationNumber}
                        </div>
                      ) : (
                        <span className="text-xs pg-muted italic">None assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="text-white font-semibold">{d.totalTrips || 0} trips</div>
                      <div className="pg-muted">{d.totalKm?.toLocaleString() || 0} km</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[d.status] || statusColors.AVAILABLE}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && drivers.length > 0 && (
          <div className="p-4 border-t pg-divider bg-slate-800/50 flex items-center justify-between text-sm pg-muted">
            <div>
              Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchDrivers(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => fetchDrivers(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drivers;
