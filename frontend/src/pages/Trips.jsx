import React, { useEffect, useState } from 'react';
import { tripApi, downloadCSV } from '../api';
import { useAuthStore } from '../store/authStore';
import { Route, Search, Play, CheckCircle, Download, Clock, MapPin, Truck, User, AlertCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Trips = () => {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchTrips = async (currentPage = 1, currentStatus = statusFilter, searchQuery = search) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (currentStatus) params.status = currentStatus;
      if (searchQuery) params.search = searchQuery;

      const { data } = await tripApi.getAll(params);
      setTrips(data.data);
      setTotalPages(data.pagination.totalPages || 1);
      setPage(data.pagination.page || 1);
    } catch (err) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(1, statusFilter, search);
  }, [statusFilter, search]);

  const handleUpdateStatus = async (tripId, newStatus, reason = '') => {
    try {
      await tripApi.updateStatus(tripId, { status: newStatus, reason });
      toast.success(`Trip status updated to ${newStatus}`);
      fetchTrips(page, statusFilter, search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update trip status');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await tripApi.export({ status: statusFilter });
      downloadCSV(res, 'trips-report.csv');
      toast.success('Trips exported successfully');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const statusColors = {
    PLANNED: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    ASSIGNED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    STARTED: 'bg-[#fff5f3] text-[#ff6b4a] border-[#ff6b4a]/30',
    DELAYED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl pg-heading flex items-center gap-2">
            <Route className="w-6 h-6 text-[#ff6b4a]" />
            Trips & Operations
          </h1>
          <p className="text-sm pg-muted mt-1">Manage scheduled logistics dispatches and live route tracking</p>
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
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {['', 'STARTED', 'ASSIGNED', 'PLANNED', 'DELAYED', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {st === '' ? 'ALL TRIPS' : st}
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
              placeholder="Search by trip number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pg-select w-full pl-9 pr-4 py-2  g text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* Trips Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs pg-muted uppercase bg-slate-900/50 border-b pg-divider">
              <tr>
                <th className="px-6 py-4 font-semibold">Trip ID</th>
                <th className="px-6 py-4 font-semibold">Route & Cargo</th>
                <th className="px-6 py-4 font-semibold">Vehicle</th>
                <th className="px-6 py-4 font-semibold">Driver</th>
                <th className="px-6 py-4 font-semibold">Schedule</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center pg-muted">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#ff6b4a]/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                    Loading trip records...
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center pg-muted">
                    No trips found for the selected filter.
                  </td>
                </tr>
              ) : (
                trips.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-white">{t.tripNumber}</div>
                      <div className="text-xs pg-muted">
                        {t.totalDistance ? `${t.totalDistance} km` : `${t.routeId?.distance || 0} km est.`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#ff6b4a] shrink-0" />
                        {t.routeId ? `${t.routeId.origin?.city} → ${t.routeId.destination?.city}` : 'Custom Route'}
                      </div>
                      <div className="text-xs pg-muted mt-0.5 truncate max-w-xs">
                        Cargo: {typeof t.cargoDetails === 'string' ? t.cargoDetails : t.cargoDetails?.description || 'General Cargo'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-semibold text-slate-200">
                        {t.vehicleId?.registrationNumber || 'Unassigned'}
                      </div>
                      <div className="text-xs pg-muted capitalize">{t.vehicleId?.vehicleType?.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">
                        {t.driverId?.userId?.name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-300">
                        {t.plannedStartTime ? new Date(t.plannedStartTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      </div>
                      {t.delayReason && (
                        <div className="text-xs text-amber-400 mt-0.5 truncate max-w-[140px]" title={t.delayReason}>
                          ⚠️ {t.delayReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[t.status] || statusColors.PLANNED}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleUpdateStatus(t._id, 'STARTED')}
                            className="px-2.5 py-1 btn-coral rounded text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <Play className="w-3 h-3" /> Start
                          </button>
                        )}
                        {(t.status === 'STARTED' || t.status === 'DELAYED') && (
                          <button
                            onClick={() => handleUpdateStatus(t._id, 'COMPLETED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" /> Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && trips.length > 0 && (
          <div className="p-4 border-t pg-divider bg-slate-800/50 flex items-center justify-between text-sm pg-muted">
            <div>
              Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchTrips(page - 1, statusFilter, search)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => fetchTrips(page + 1, statusFilter, search)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
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

export default Trips;
