import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Briefcase, ArrowLeft, CheckSquare, Clock, AlertTriangle, UserCheck } from 'lucide-react';

export const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        if (res.data.success) {
          setProject(res.data.project);
          setTasks(res.data.tasks);
        }
      } catch (err) {
        console.error('Error fetching project detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="p-8 text-xs text-indigo-400">Loading project details...</div>;
  if (!project) return <div className="p-8 text-xs text-red-400">Project not found.</div>;

  return (
    <div className="p-8 space-y-8">
      <Link to="/projects" className="inline-flex items-center gap-1 text-xs text-indigo-400 font-semibold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to All Projects
      </Link>

      {/* Project Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-100">{project.name}</h1>
          <span className={`text-xs px-2.5 py-1 rounded font-bold ${
            project.status === 'Delayed' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {project.status}
          </span>
        </div>
        <p className="text-xs text-gray-300">{project.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-800 text-xs">
          <div>
            <span className="text-gray-500 block">Department</span>
            <span className="font-semibold text-gray-200">{project.department}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Priority</span>
            <span className="font-semibold text-amber-400">{project.priority}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Risk Score</span>
            <span className="font-semibold text-red-400">{project.risk_score}/100</span>
          </div>
          <div>
            <span className="text-gray-500 block">Budget Allocation</span>
            <span className="font-semibold text-emerald-400">${project.budget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Linked Tasks */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Associated Milestone Tasks ({tasks.length})</h3>
        <div className="space-y-3">
          {tasks.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-200 text-xs">{t.title}</h4>
                <p className="text-[11px] text-gray-400">{t.description}</p>
              </div>
              <span className="text-xs text-indigo-400 font-semibold">{t.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
