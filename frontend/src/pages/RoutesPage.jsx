import React, { useEffect, useState } from 'react';
import { routeApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { MapPin, Plus, Search, Navigation, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const RoutesPage = () => {
  const { user } = useAuthStore();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data } = await routeApi.getAll({ search });
      setRoutes(data.data || []);
    } catch (err) {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl pg-heading flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#ff6b4a]" />
            Standard Fleet Routes
          </h1>
          <p className="text-sm pg-muted mt-1">Interstate transit corridors, distance calculation & route definitions</p>
        </div>
      </div>

      {/* Grid of Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center pg-muted">
            <div className="flex justify-center mb-2">
              <div className="w-6 h-6 border-2 border-[#ff6b4a]/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
            Loading routes...
          </div>
        ) : routes.length === 0 ? (
          <div className="pg-card col-span-full py-12 text-center pg-muted ">
            No routes defined.
          </div>
        ) : (
          routes.map((r) => (
            <div
              key={r._id}
              className="pg-card  rounded-2xl p-5 hover:border-slate-600 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-[#fff5f3] text-[#ff6b4a] border border-[#ff6b4a]/20">
                    {r.routeCode}
                  </span>
                  <span className="text-xs pg-muted font-semibold px-2 py-0.5 rounded bg-slate-900">
                    {r.routeType}
                  </span>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs pg-muted">Origin</span>
                      <p className="font-semibold text-white text-sm">{r.origin?.city}, {r.origin?.state}</p>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-slate-700 ml-1.5 h-4" />

                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
                    <div>
                      <span className="text-xs pg-muted">Destination</span>
                      <p className="font-semibold text-white text-sm">{r.destination?.city}, {r.destination?.state}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t pg-divider/60 flex items-center justify-between text-xs pg-muted">
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#ff6b4a]" />
                  <span className="font-mono font-medium text-white">{r.distance} km</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{Math.floor((r.estimatedDuration || 0) / 60)} hrs {(r.estimatedDuration || 0) % 60}m</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoutesPage;
