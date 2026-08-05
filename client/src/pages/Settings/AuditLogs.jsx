import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldCheck, User, Clock, Activity, Lock } from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/analytics');
      if (res.data.success) setLogs(res.data.auditLogs || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Enterprise Audit Logs & Compliance Governance
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Immutable audit trail of security events, AI queries, and data modifications for SOC2 compliance.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource Target</th>
                <th className="p-3">Details</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {logs.map((lg) => (
                <tr key={lg.id} className="hover:bg-gray-800/30 transition">
                  <td className="p-3 font-semibold text-gray-200">{lg.user_name || 'System'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {lg.action}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{lg.resource}</td>
                  <td className="p-3 text-gray-300 font-mono text-[11px] truncate max-w-xs">{lg.details}</td>
                  <td className="p-3 text-gray-500">{new Date(lg.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
