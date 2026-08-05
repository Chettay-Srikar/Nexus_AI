import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building, DollarSign, Users, Briefcase, Plus } from 'lucide-react';

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) setDepartments(res.data.departments);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-400" />
            Department Management & Budgets
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Overview of active organizational units, headcount, and budget allocations.</p>
        </div>
        <button
          onClick={() => alert('Opening Create Department Modal...')}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Create Department
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  CODE: {dept.code}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Headcount: {dept.head_count}
                </span>
              </div>
              <h3 className="font-bold text-gray-100 text-base">{dept.name}</h3>
              <p className="text-xs text-gray-400">Department Lead: <strong className="text-gray-200">{dept.manager_name || 'Sarah Jenkins'}</strong></p>
            </div>

            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-gray-500 block text-[10px] uppercase">Annual Budget</span>
                <span className="font-extrabold text-emerald-400">${(dept.budget || 0).toLocaleString()}</span>
              </div>
              <button
                onClick={() => alert(`Editing budget for ${dept.name}`)}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold border border-gray-700 transition"
              >
                Edit Allocation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
