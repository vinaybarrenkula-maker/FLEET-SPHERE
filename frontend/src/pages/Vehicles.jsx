import React, { useEffect, useState } from 'react';
import { vehicleApi } from '../api';
import { Truck, Plus, Search, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();

  const fetchVehicles = async (currentPage = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const { data } = await vehicleApi.getAll({ page: currentPage, limit: 10, search: searchQuery });
      setVehicles(data.data);
      setTotalPages(data.pagination.totalPages);
      setPage(data.pagination.page);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(1, search);
  }, [search]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      fetchVehicles(newPage, search);
    }
  };

  const statusColors = {
    AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ASSIGNED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    ON_TRIP: 'bg-[#fff5f3] text-[#ff6b4a] border-[#ff6b4a]/20',
    MAINTENANCE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    INACTIVE: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl pg-heading flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#ff6b4a]" />
            Vehicles Directory
          </h1>
          <p className="text-sm pg-muted mt-1">Manage fleet vehicles, status, and details</p>
        </div>
        
        {['SUPER_ADMIN', 'FLEET_MANAGER', 'BRANCH_MANAGER'].includes(user?.role) && (
          <button className="btn-coral rounded-xl px-4 py-2  flex items-center gap-2 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        )}
      </div>

      <div className="pg-card  shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b pg-divider flex items-center justify-between bg-slate-800/50">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pg-muted" />
            <input 
              type="text"
              placeholder="Search by registration, make, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pg-select w-full pl-9 pr-4 py-2  g text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs pg-muted uppercase bg-slate-900/50 border-b pg-divider">
              <tr>
                <th className="px-6 py-4 font-semibold">Vehicle</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Branch</th>
                <th className="px-6 py-4 font-semibold">Mileage</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center pg-muted">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#ff6b4a]/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                    Loading vehicles...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center pg-muted">
                    No vehicles found matching your criteria.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{v.registrationNumber}</div>
                      <div className="text-xs pg-muted mt-0.5">{v.manufacturer} {v.model} ({v.year})</div>
                    </td>
                    <td className="px-6 py-4">{v.vehicleType.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">{v.branchId?.name}</div>
                      <div className="text-xs pg-muted">{v.branchId?.city}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{v.currentMileage?.toLocaleString()} km</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[v.status] || statusColors.INACTIVE}`}>
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 pg-muted hover:text-white hover:bg-slate-700 rounded transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 pg-muted hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && vehicles.length > 0 && (
          <div className="p-4 border-t pg-divider bg-slate-800/50 flex items-center justify-between text-sm pg-muted">
            <div>
              Showing page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:hover:bg-slate-700 text-white transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:hover:bg-slate-700 text-white transition-colors"
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

export default Vehicles;
