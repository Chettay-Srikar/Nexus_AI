import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Mail, Building, Phone, ShieldCheck, Key } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || 'Engineering');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', { name, department });
      if (res.data.success) {
        alert('Profile details updated successfully!');
      }
    } catch (err) {
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex items-center gap-4">
        <img
          src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Profile'}
          alt={user?.name}
          className="w-16 h-16 rounded-full border-2 border-indigo-500 bg-gray-800"
        />
        <div>
          <h1 className="text-xl font-bold text-gray-100">{user?.name}</h1>
          <p className="text-xs text-indigo-400 font-semibold">{user?.role} • {user?.department} Department</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Edit Account Information</h3>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Corporate Email (Read Only)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Assigned Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-gray-200 focus:outline-none"
            >
              <option>Engineering</option>
              <option>Executive</option>
              <option>HR</option>
              <option>Marketing</option>
              <option>Support</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
