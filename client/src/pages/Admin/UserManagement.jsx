import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Shield, Mail, Building, Plus, Phone } from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data?.success) setUsers(res.data.data?.users ?? res.data.users ?? []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Enterprise User Governance & Directory
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage user access roles, corporate emails, and active permissions.</p>
        </div>
        <button
          onClick={() => alert('Opening New User Onboarding Modal...')}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Onboard New User
        </button>
      </div>

      {/* Directory Table */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-3">User Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Department</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {(Array.isArray(users) ? users : []).map((u) => (
                <tr key={u.id} className="hover:bg-gray-800/30 transition">
                  <td className="p-3 font-semibold text-gray-100 flex items-center gap-2.5">
                    <img
                      src={u.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                      alt={u.name}
                      className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700"
                    />
                    <span>{u.name}</span>
                  </td>
                  <td className="p-3 text-gray-400">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'Administrator' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      u.role === 'Executive' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      u.role === 'Manager' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">{u.department}</td>
                  <td className="p-3 text-gray-400">{u.phone || 'N/A'}</td>
                  <td className="p-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
