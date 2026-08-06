import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export const EnterpriseAnalytics = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      if (res.data?.success) setMetrics(res.data?.data ?? res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const revenueData = [
    { month: 'Jan', revenue: 120000, target: 110000 },
    { month: 'Feb', revenue: 145000, target: 125000 },
    { month: 'Mar', revenue: 160000, target: 140000 },
    { month: 'Apr', revenue: 155000, target: 150000 },
    { month: 'May', revenue: 190000, target: 165000 },
    { month: 'Jun', revenue: 220000, target: 180000 },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Enterprise Analytics & Executive BI
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Real-time organizational performance metrics, meeting efficiency, and employee productivity indicators.</p>
        </div>
        <button
          onClick={() => alert('Generating Executive Summary Report PDF...')}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Executive Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <p className="text-xs text-gray-400 font-semibold uppercase">Productivity Index</p>
          <h3 className="text-3xl font-extrabold text-emerald-400">{metrics?.metrics?.productivityIndex || 92}%</h3>
          <p className="text-[11px] text-gray-500">+4.2% from last quarter</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <p className="text-xs text-gray-400 font-semibold uppercase">Meeting Efficiency</p>
          <h3 className="text-3xl font-extrabold text-indigo-400">{metrics?.metrics?.meetingEfficiency || 88}%</h3>
          <p className="text-[11px] text-gray-500">Average meeting duration reduced by 12 mins</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
          <p className="text-xs text-gray-400 font-semibold uppercase">AI Health Score</p>
          <h3 className="text-3xl font-extrabold text-violet-400">{metrics?.metrics?.aiHealthScore || 94}/100</h3>
          <p className="text-[11px] text-gray-500">Gemini model response latency &lt; 400ms</p>
        </div>
      </div>

      {/* Revenue & Department Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Company Revenue vs Target ($)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} name="Revenue ($)" />
                <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="5 5" name="Target ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Departmental Task Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.isArray(metrics?.departmentStats) ? metrics.departmentStats : []}>
                <XAxis dataKey="department" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                <Bar dataKey="project_count" fill="#10b981" radius={[4, 4, 0, 0]} name="Active Projects" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
