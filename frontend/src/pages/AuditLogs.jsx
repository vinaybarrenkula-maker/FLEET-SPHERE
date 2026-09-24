import React, { useEffect, useState } from 'react';
import { auditApi } from '../api';
import { Shield, Search, Calendar, User, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async (currentPage = 1) => {
    setLoading(true);
    try {
      const { data } = await auditApi.getAll({ page: currentPage, limit: 15 });
      setLogs(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(data.pagination?.page || 1);
    } catch (err) {
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const actionColors = {
    CREATE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    LOGIN: 'bg-[#fff5f3] text-[#ff6b4a] border-[#ff6b4a]/30',
    APPROVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold',
    REJECT: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl pg-heading flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#ff6b4a]" />
          Security Audit Logs
        </h1>
        <p className="text-sm pg-muted mt-1">Immutable audit trail of system transactions, authentication, and state modifications</p>
      </div>

      <div className="pg-card  shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs pg-muted uppercase bg-slate-900/50 border-b pg-divider">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Actor / User</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Entity</th>
                <th className="px-6 py-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center pg-muted font-sans">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#ff6b4a]/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center pg-muted font-sans">
                    No audit logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 pg-muted whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-sans">
                      <div className="font-semibold text-white">{log.userName || log.userId?.name || 'System Actor'}</div>
                      <div className="text-[11px] pg-muted">{log.userRole || log.userId?.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${actionColors[log.action] || 'bg-slate-700 text-slate-300'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-sans text-slate-300">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4 pg-muted">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="p-4 border-t pg-divider bg-slate-800/50 flex items-center justify-between text-sm pg-muted font-sans">
            <div>
              Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => fetchLogs(page + 1)}
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

export default AuditLogs;
