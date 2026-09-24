import React, { useEffect, useState } from 'react';
import { fuelApi, vehicleApi, downloadCSV } from '../api';
import { useAuthStore } from '../store/authStore';
import { Droplet, Search, Plus, Download, IndianRupee, Gauge, Calendar, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Fuel = () => {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    vehicleId: '',
    fuelType: 'DIESEL',
    quantity: '',
    pricePerUnit: '96.50',
    odometer: '',
    fuelStation: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchFuelEntries = async (currentPage = 1) => {
    setLoading(true);
    try {
      const { data } = await fuelApi.getAll({ page: currentPage, limit: 10 });
      setEntries(data.data);
      setTotalPages(data.pagination.totalPages || 1);
      setPage(data.pagination.page || 1);
    } catch (err) {
      toast.error('Failed to load fuel records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelEntries();
    // Load vehicles for adding fuel
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
      const res = await fuelApi.export();
      downloadCSV(res, 'fuel-records.csv');
      toast.success('Fuel entries exported successfully');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleAddFuel = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.quantity || !formData.pricePerUnit || !formData.odometer) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await fuelApi.create({
        ...formData,
        quantity: Number(formData.quantity),
        pricePerUnit: Number(formData.pricePerUnit),
        odometer: Number(formData.odometer),
      });
      toast.success('Fuel record logged successfully');
      setShowAddModal(false);
      setFormData({
        vehicleId: vehicles[0]?._id || '',
        fuelType: 'DIESEL',
        quantity: '',
        pricePerUnit: '96.50',
        odometer: '',
        fuelStation: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchFuelEntries(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log fuel entry');
    }
  };

  const totalLitres = entries.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const totalCost = entries.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl pg-heading flex items-center gap-2">
            <Droplet className="w-6 h-6 text-[#ff6b4a]" />
            Fuel Log & Dispensing
          </h1>
          <p className="text-sm pg-muted mt-1">Track refuels, expenditure, and vehicle fuel economy</p>
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
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg btn-coral font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Refuel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="pg-card  rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs pg-muted font-medium">Page Total Litres</span>
            <Droplet className="w-4 h-4 text-[#ff6b4a]" />
          </div>
          <div className="text-2xl pg-heading mt-2">{Math.round(totalLitres).toLocaleString()} L</div>
        </div>
        <div className="pg-card  rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs pg-muted font-medium">Page Total Fuel Cost</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">₹{Math.round(totalCost).toLocaleString()}</div>
        </div>
        <div className="pg-card  rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs pg-muted font-medium">Avg Fuel Rate</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl pg-heading mt-2">
            ₹{entries.length > 0 ? (totalCost / (totalLitres || 1)).toFixed(2) : '0.00'} / L
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="pg-card  shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs pg-muted uppercase bg-slate-900/50 border-b pg-divider">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & Station</th>
                <th className="px-6 py-4 font-semibold">Vehicle</th>
                <th className="px-6 py-4 font-semibold">Submitted By</th>
                <th className="px-6 py-4 font-semibold">Volume</th>
                <th className="px-6 py-4 font-semibold">Rate</th>
                <th className="px-6 py-4 font-semibold">Total Cost</th>
                <th className="px-6 py-4 font-semibold">Odometer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center pg-muted">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#ff6b4a]/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                    Loading fuel logs...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center pg-muted">
                    No fuel entries found.
                  </td>
                </tr>
              ) : (
                entries.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {new Date(f.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs pg-muted">{f.fuelStation || 'Station Unspecified'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-semibold text-[#ff6b4a]">
                        {f.vehicleId?.registrationNumber || 'N/A'}
                      </div>
                      <div className="text-xs pg-muted capitalize">{f.fuelType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-200">{f.driverId?.userId?.name || user?.name}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{f.quantity} Litres</td>
                    <td className="px-6 py-4 font-mono text-slate-300">₹{f.pricePerUnit}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">₹{Math.round(f.totalCost).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {f.odometer ? `${f.odometer.toLocaleString()} km` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && entries.length > 0 && (
          <div className="p-4 border-t pg-divider bg-slate-800/50 flex items-center justify-between text-sm pg-muted">
            <div>
              Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchFuelEntries(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => fetchFuelEntries(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Fuel */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="pg-card  rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b pg-divider pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Droplet className="w-5 h-5 text-[#ff6b4a]" />
                Record Fuel Dispense
              </h2>
              <button onClick={() => setShowAddModal(false)} className="pg-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFuel} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Vehicle</label>
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
                  <label className="block text-slate-300 font-medium mb-1">Litres Dispensed</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="pg-select w-full px-3 py-2  g text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Price per Litre (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                    className="pg-select w-full px-3 py-2  g text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Odometer Reading (KM)</label>
                  <input
                    type="number"
                    placeholder="e.g. 24500"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                    className="pg-select w-full px-3 py-2  g text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Refuel Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pg-select w-full px-3 py-2  g text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Fuel Station Name</label>
                <input
                  type="text"
                  placeholder="e.g. HPCL Jubilee Hills, Hyderabad"
                  value={formData.fuelStation}
                  onChange={(e) => setFormData({ ...formData, fuelStation: e.target.value })}
                  className="pg-select w-full px-3 py-2  g text-white"
                />
              </div>

              {formData.quantity && formData.pricePerUnit && (
                <div className="p-3 bg-[#fff5f3] border border-[#ff6b4a]/20 rounded-xl flex justify-between items-center text-sm">
                  <span className="text-slate-300">Estimated Total Cost:</span>
                  <span className="font-bold text-white text-base">
                    ₹{(Number(formData.quantity) * Number(formData.pricePerUnit)).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t pg-divider">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 btn-coral rounded-xl font-medium "
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fuel;
