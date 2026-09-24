import React, { useEffect, useState } from 'react';
import { expenseApi, vehicleApi, downloadCSV } from '../api';
import { useAuthStore } from '../store/authStore';
import { Receipt, Plus, Download, Search, Check, X, IndianRupee, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Expenses = () => {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  const isApprover = ['SUPER_ADMIN', 'FLEET_MANAGER', 'BRANCH_MANAGER', 'FINANCE_OFFICER'].includes(user?.role);

  const [formData, setFormData] = useState({
    vehicleId: '',
    category: 'TOLL',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchExpenses = async (currentPage = 1, currentStatus = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (currentStatus) params.status = currentStatus;

      const { data } = await expenseApi.getAll(params);
      setExpenses(data.data);
      setTotalPages(data.pagination.totalPages || 1);
      setPage(data.pagination.page || 1);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(1, statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    vehicleApi.getAll({ limit: 50 }).then((res) => {
      setVehicles(res.data.data || []);
      if (res.data.data?.length > 0) {
        setFormData((prev) => ({ ...prev, vehicleId: res.data.data[0]._id }));
      }
    }).catch(() => {});
  }, []);

  const handleApprove = async (id) => {
    try {
      await expenseApi.approve(id);
      toast.success('Expense claim approved');
      fetchExpenses(page, statusFilter);
    } catch (err) {
      toast.error('Failed to approve expense');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Please enter reason for rejection:');
    if (!reason) return;
    try {
      await expenseApi.reject(id, { rejectionReason: reason });
      toast.success('Expense rejected');
      fetchExpenses(page, statusFilter);
    } catch (err) {
      toast.error('Failed to reject expense');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await expenseApi.export({ status: statusFilter });
      downloadCSV(res, 'expenses-report.csv');
      toast.success('Expenses exported');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      toast.error('Amount and description are required');
      return;
    }
    try {
      await expenseApi.create({
        ...formData,
        amount: Number(formData.amount),
      });
      toast.success('Expense claim submitted');
      setShowModal(false);
      setFormData({
        vehicleId: vehicles[0]?._id || '',
        category: 'TOLL',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchExpenses(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit expense');
    }
  };

  const statusColors = {
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold',
    REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl pg-heading flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#ff6b4a]" />
            Operational Expenses
          </h1>
          <p className="text-sm pg-muted mt-1">Expense reimbursement claims, tolls, allowances & approval workflow</p>
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
            className="px-4 py-2 rounded-lg btn-coral font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Submit Expense
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-1">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {st === '' ? 'ALL EXPENSES' : st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="pg-card  shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs pg-muted uppercase bg-slate-900/50 border-b pg-divider">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & Category</th>
                <th className="px-6 py-4 font-semibold">Vehicle</th>
                <th className="px-6 py-4 font-semibold">Submitted By</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                {isApprover && <th className="px-6 py-4 font-semibold text-right">Approval Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={isApprover ? 7 : 6} className="px-6 py-8 text-center pg-muted">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#ff6b4a]/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={isApprover ? 7 : 6} className="px-6 py-8 text-center pg-muted">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white">
                        {new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono mt-0.5 inline-block">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-semibold text-[#ff6b4a]">
                        {e.vehicleId?.registrationNumber || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-200">{e.submittedBy?.name || user?.name}</div>
                      <div className="text-xs pg-muted">{e.submittedBy?.role || user?.role}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white font-mono text-base">
                      ₹{e.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-300">
                      {e.description}
                      {e.rejectionReason && (
                        <div className="text-xs text-rose-400 mt-1">Reason: {e.rejectionReason}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[e.status] || statusColors.PENDING}`}>
                        {e.status}
                      </span>
                    </td>
                    {isApprover && (
                      <td className="px-6 py-4 text-right">
                        {e.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(e._id)}
                              className="p-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors"
                              title="Approve Expense"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(e._id)}
                              className="p-1.5 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white transition-colors"
                              title="Reject Expense"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs pg-muted">Decided</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && expenses.length > 0 && (
          <div className="p-4 border-t pg-divider bg-slate-800/50 flex items-center justify-between text-sm pg-muted">
            <div>
              Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchExpenses(page - 1, statusFilter)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => fetchExpenses(page + 1, statusFilter)}
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
                <Receipt className="w-5 h-5 text-[#ff6b4a]" />
                Submit New Expense Claim
              </h2>
              <button onClick={() => setShowModal(false)} className="pg-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Expense Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="pg-select w-full px-3 py-2  g text-white"
                  >
                    <option value="TOLL">Toll Tax</option>
                    <option value="PARKING">Parking Fee</option>
                    <option value="DRIVER_ALLOWANCE">Driver Per Diem</option>
                    <option value="FUEL">Emergency Fuel</option>
                    <option value="REPAIR">Emergency Repair</option>
                    <option value="OTHER">Other Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 750"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="pg-select w-full px-3 py-2  g text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Vehicle (Optional)</label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="pg-select w-full px-3 py-2  g text-white"
                  >
                    <option value="">No Vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.registrationNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date</label>
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
                <label className="block text-slate-300 font-medium mb-1">Expense Description</label>
                <textarea
                  rows="3"
                  placeholder="Detail expense reason, toll booth location, or attached receipt note..."
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
                  className="px-4 py-2 btn-coral rounded-xl font-medium "
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
