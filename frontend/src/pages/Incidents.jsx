import React, { useEffect, useState } from 'react';
import { incidentApi, vehicleApi, downloadCSV } from '../api';
import { useAuthStore } from '../store/authStore';
import { AlertTriangle, Plus, Download, Search, CheckCircle, ShieldAlert, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Incidents = () => {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    vehicleId: '',
    incidentType: 'ACCIDENT',
    severity: 'MEDIUM',
    incidentDate: new Date().toISOString().split('T')[0],
    city: '',
    state: '',
    description: '',
  });

  const fetchIncidents = async (currentPage = 1) => {
    setLoading(true);
    try {
      const { data } = await incidentApi.getAll({ page: currentPage, limit: 10 });
      setIncidents(data.data);
      setTotalPages(data.pagination.totalPages || 1);
      setPage(data.pagination.page || 1);
    } catch (err) {
      toast.error('Failed to load incident reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    vehicleApi.getAll({ limit: 50 }).then((res) => {
      setVehicles(res.data.data || []);
      if (res.data.data?.length > 0) {
        setFormData((prev) => ({ ...prev, vehicleId: res.data.data[0]._id }));
      }
    }).catch(() => {});
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await incidentApi.export();
      downloadCSV(res, 'incidents-report.csv');
      toast.success('Incidents exported');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleReportIncident = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.description) {
      toast.error('Please fill in vehicle and description');
      return;
    }
    try {
      await incidentApi.create({
        vehicleId: formData.vehicleId,
        incidentType: formData.incidentType,
        severity: formData.severity,
        incidentDate: formData.incidentDate,
        location: { city: formData.city, state: formData.state },
        description: formData.description,
      });
      toast.success('Incident reported successfully');
      setShowModal(false);
      setFormData({
        vehicleId: vehicles[0]?._id || '',
        incidentType: 'ACCIDENT',
        severity: 'MEDIUM',
        incidentDate: new Date().toISOString().split('T')[0],
        city: '',
        state: '',
        description: '',
      });
      fetchIncidents(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report incident');
    }
  };

  const severityColors = {
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };

  const statusColors = {
    REPORTED: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    UNDER_INVESTIGATION: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    CLOSED: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl pg-heading flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Incidents & Claims
          </h1>
          <p className="text-sm pg-muted mt-1">Accident reporting, roadside breakdowns, and investigation tracker</p>
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
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Report Incident
          </button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="pg-card  shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs pg-muted uppercase bg-slate-900/50 border-b pg-divider">
              <tr>
                <th className="px-6 py-4 font-semibold">Incident Date</th>
                <th className="px-6 py-4 font-semibold">Vehicle</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Severity</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Description</th>
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
                    Loading incident reports...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center pg-muted">
                    No incidents logged. Fleet is running safely!
                  </td>
                </tr>
              ) : (
                incidents.map((i) => (
                  <tr key={i._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                      {new Date(i.incidentDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-semibold text-[#ff6b4a]">
                        {i.vehicleId?.registrationNumber || 'N/A'}
                      </div>
                      <div className="text-xs pg-muted">{i.vehicleId?.vehicleType}</div>
                    </td>
                    <td className="px-6 py-4 capitalize font-medium text-slate-200">
                      {i.incidentType.replace('_', ' ').toLowerCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs border ${severityColors[i.severity] || severityColors.LOW}`}>
                        {i.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {i.location?.city ? `${i.location.city}, ${i.location.state || ''}` : 'Location unlisted'}
                    </td>
                    <td className="px-6 py-4 max-w-sm truncate pg-muted" title={i.description}>
                      {i.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[i.status] || statusColors.REPORTED}`}>
                        {i.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && incidents.length > 0 && (
          <div className="p-4 border-t pg-divider bg-slate-800/50 flex items-center justify-between text-sm pg-muted">
            <div>
              Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchIncidents(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => fetchIncidents(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="pg-card  rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b pg-divider pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Report New Incident
              </h2>
              <button onClick={() => setShowModal(false)} className="pg-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Vehicle Involved</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="pg-select w-full px-3 py-2  g text-white"
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} ({v.manufacturer} {v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Incident Type</label>
                  <select
                    value={formData.incidentType}
                    onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                    className="pg-select w-full px-3 py-2  g text-white"
                  >
                    <option value="ACCIDENT">Accident / Collision</option>
                    <option value="BREAKDOWN">Mechanical Breakdown</option>
                    <option value="TRAFFIC_VIOLATION">Traffic Violation / Challan</option>
                    <option value="CARGO_DAMAGE">Cargo Loss / Damage</option>
                    <option value="OTHER">Other Issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Severity Level</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="pg-select w-full px-3 py-2  g text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">City / Highway</label>
                  <input
                    type="text"
                    placeholder="e.g. Kurnool bypass"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="pg-select w-full px-3 py-2  g text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Incident Date</label>
                  <input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="pg-select w-full px-3 py-2  g text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Incident Description</label>
                <textarea
                  rows="3"
                  placeholder="Provide detailed information regarding the incident, damages, and immediate actions taken..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="pg-select w-full px-3 py-2  g text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t pg-divider">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
