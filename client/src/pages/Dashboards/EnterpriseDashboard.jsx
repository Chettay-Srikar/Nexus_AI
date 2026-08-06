import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Briefcase,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
  ShieldAlert,
  Activity,
  Plus,
  Clock,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export const EnterpriseDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analRes, projRes] = await Promise.all([
          api.get('/analytics'),
          api.get('/projects')
        ]);
        console.log("Analytics Response:", analRes.data);
        console.log("Projects Response:", projRes.data);
        if (analRes.data?.success) {
          setAnalytics(analRes.data?.data ?? analRes.data);
        }
        if (projRes.data?.success) {
          setProjects(projRes.data?.data?.projects ?? projRes.data?.projects ?? []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { title: 'Total Projects', value: analytics?.metrics?.totalProjects || 4, icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Delayed Projects', value: analytics?.metrics?.delayedProjects || 1, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Completed Tasks', value: `${analytics?.metrics?.completedTasks || 2} / ${analytics?.metrics?.totalTasks || 4}`, icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'AI Health Index', value: `${analytics?.metrics?.aiHealthScore || 94}%`, icon: Activity, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            Welcome back, {user?.name}
            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Role: {user?.role}
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Department: <strong className="text-gray-200">{user?.department}</strong> | Here is your enterprise real-time operational overview.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className="glass-panel p-5 rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{st.title}</p>
                <h3 className="text-2xl font-extrabold text-gray-100 mt-1">{st.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${st.bg} ${st.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Risk Metrics */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Department Risk Scores & Active Projects
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.isArray(analytics?.departmentStats) ? analytics.departmentStats : []}>
                <XAxis dataKey="department" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                <Bar dataKey="avg_risk" fill="#6366f1" radius={[4, 4, 0, 0]} name="Average Risk Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Health & Insights */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            AI Executive Insights
          </h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 text-xs space-y-1">
              <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" /> High Efficiency Alert
              </p>
              <p className="text-gray-400">Engineering productivity index increased by 14% following meeting action automated sync.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 text-xs space-y-1">
              <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Bottleneck Warning
              </p>
              <p className="text-gray-400">Q3 Marketing Rebrand has pending executive signoffs for over 5 days.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Projects Table */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Active Enterprise Projects</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-3">Project Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {(Array.isArray(projects) ? projects : []).map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/30 transition">
                  <td className="p-3 font-semibold text-gray-100">{p.name}</td>
                  <td className="p-3">{p.department}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      p.priority === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}>
                      {p.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${p.status === 'Completed' ? 'text-emerald-400 bg-emerald-500/10' :
                      p.status === 'Delayed' ? 'text-red-400 bg-red-500/10' :
                        'text-indigo-400 bg-indigo-500/10'
                      }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 font-medium">
                    <span className={p.risk_score > 70 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {p.risk_score} / 100
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="w-28 bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
