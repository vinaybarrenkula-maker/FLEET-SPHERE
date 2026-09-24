import React, { useEffect, useState } from 'react';
import { maintenanceApi, downloadCSV } from '../api';
import { useAuthStore } from '../store/authStore';
import { Wrench, Plus, Download, Search, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Maintenance = () => {
  const { user } = useAuthStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchRecords = async (currentPage = 1) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const { data } = await maintenanceApi.getAll(params);
      setRecords(data.data);
      setTotalPages(data.pagination.totalPages || 1);
      setPage(data.pagination.page || 1);
    } catch (err) {
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(1);
  }, [statusFilter]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await maintenanceApi.export({ status: statusFilter });
      downloadCSV(res, 'maintenance-log.csv');
      toast.success('Maintenance records exported');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const statusColors = {
    SCHEDULED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    OVERDUE: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold animate-pulse',
    CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl pg-heading flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#ff6b4a]" />
            Vehicle Maintenance & Service
          </h1>
          <p className="text-sm pg-muted mt-1">Preventive servicing, scheduled repairs, and workshop invoices</p>
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
        {['', 'SCHEDULED', 'IN_PROGRESS', 'OVERDUE', 'COMPLETED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {st === '' ? 'ALL SERVICES' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="pg-card  shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs pg-muted uppercase bg-slate-900/50 border-b pg-divider">
              <tr>
                <th className="px-6 py-4 font-semibold">Vehicle</th>
                <th className="px-6 py-4 font-semibold">Service Type</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Scheduled Date</th>
                <th className="px-6 py-4 font-semibold">Vendor / Workshop</th>
                <th className="px-6 py-4 font-semibold">Cost</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center pg-muted">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#ff6b4a]/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                    Loading maintenance records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center pg-muted">
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                records.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-semibold text-[#ff6b4a]">
                        {m.vehicleId?.registrationNumber || 'N/A'}
                      </div>
                      <div className="text-xs pg-muted">{m.vehicleId?.vehicleType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-white">
                        {m.serviceType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-300" title={m.description}>
                      {m.description || 'General maintenance'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300">
                      {m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {m.vendor?.name || 'In-house Workshop'}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-emerald-400">
                      ₹{(m.actualCost || m.estimatedCost || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[m.status] || statusColors.SCHEDULED}`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && records.length > 0 && (
          <div className="p-4 border-t pg-divider bg-slate-800/50 flex items-center justify-between text-sm pg-muted">
            <div>
              Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchRecords(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => fetchRecords(page + 1)}
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

export default Maintenance;
