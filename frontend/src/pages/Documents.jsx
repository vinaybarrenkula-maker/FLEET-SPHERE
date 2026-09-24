import React, { useEffect, useState } from 'react';
import { documentApi } from '../api';
import { FileText, Plus, Search, Calendar, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await documentApi.getAll();
      setDocuments(data.data || []);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl pg-heading flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#ff6b4a]" />
            Compliance & Document Locker
          </h1>
          <p className="text-sm pg-muted mt-1">RC books, insurance policies, permits, pollution certificates & licenses</p>
        </div>
      </div>

      <div className="pg-card  shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs pg-muted uppercase bg-slate-900/50 border-b pg-divider">
              <tr>
                <th className="px-6 py-4 font-semibold">Document Title</th>
                <th className="px-6 py-4 font-semibold">Entity Type</th>
                <th className="px-6 py-4 font-semibold">Doc Category</th>
                <th className="px-6 py-4 font-semibold">Expiry Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center pg-muted">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#ff6b4a]/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                    Loading document repository...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center pg-muted">
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {doc.title}
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-300">
                      {doc.entityType?.toLowerCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 text-xs font-mono">
                        {doc.documentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('en-IN') : 'Permanent'}
                    </td>
                    <td className="px-6 py-4">
                      {doc.isExpired ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-max">
                          <AlertCircle className="w-3 h-3" /> Expired
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                          <ShieldCheck className="w-3 h-3" /> Valid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#ff6b4a] hover:text-[#ff8a73] font-medium"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs pg-muted">No link</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Documents;
