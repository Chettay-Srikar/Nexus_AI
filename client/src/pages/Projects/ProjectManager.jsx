import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Briefcase, 
  Plus, 
  CheckSquare, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  UserCheck,
  Edit2,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  DollarSign
} from 'lucide-react';

export const ProjectManager = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'kanban' | 'table' | 'timeline'
  const [viewMode, setViewMode] = useState('kanban');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // Modals & Selection State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState(null);

  // Forms
  const [projectForm, setProjectForm] = useState({
    name: '', description: '', priority: 'Medium', status: 'In Progress', budget: 50000, department: 'Engineering', start_date: '', end_date: ''
  });

  const [taskForm, setTaskForm] = useState({
    project_id: '', title: '', description: '', priority: 'Medium', status: 'To Do', due_date: '', estimated_hours: 8
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks')
      ]);

      const pData = pRes.data.data?.projects || pRes.data.projects || [];
      const tData = tRes.data.data?.tasks || tRes.data.tasks || [];

      setProjects(pData);
      setTasks(tData);
    } catch (err) {
      console.error('Error fetching projects/tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, projectForm);
      } else {
        await api.post('/projects', projectForm);
      }
      setShowProjectModal(false);
      setEditingProject(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setDeleteConfirmProject(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, taskForm);
      } else {
        await api.post('/tasks', taskForm);
      }
      setShowTaskModal(false);
      setEditingTask(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setDeleteConfirmTask(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleTaskStatusToggle = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'To Do' : 'Completed';
    try {
      await api.put(`/tasks/${taskId}/status`, { status: nextStatus });
      fetchData();
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const exportProjectsCSV = () => {
    const headers = ['ID,Name,Department,Priority,Status,Risk Score,Budget\n'];
    const rows = (Array.isArray(projects) ? projects : []).map(p => `${p.id},"${p.name}",${p.department},${p.priority},${p.status},${p.risk_score},${p.budget}\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexusAI_Projects_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredProjects = (Array.isArray(projects) ? projects : []).filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || p.department === selectedDept;
    const matchesPriority = selectedPriority === 'All' || p.priority === selectedPriority;
    return matchesSearch && matchesDept && matchesPriority;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            Project & Task Intelligence
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage enterprise projects and tasks with AI risk evaluation and delay predictions.</p>
        </div>

        {/* View Modes Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={exportProjectsCSV}
            className="px-3.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditingProject(null);
              setProjectForm({ name: '', description: '', priority: 'Medium', status: 'In Progress', budget: 50000, department: 'Engineering', start_date: '', end_date: '' });
              setShowProjectModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
          <button
            onClick={() => {
              setEditingTask(null);
              setTaskForm({ project_id: projects[0]?.id || '', title: '', description: '', priority: 'Medium', status: 'To Do', due_date: '', estimated_hours: 8 });
              setShowTaskModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Filter & Search Panel */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects or tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Support">Support</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Table View Mode */}
      {viewMode === 'table' ? (
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Enterprise Projects Table Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-3">Project Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Budget</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-800/30 transition">
                    <td className="p-3 font-semibold text-gray-100">{p.name}</td>
                    <td className="p-3">{p.department}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">{p.priority}</span></td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-semibold text-indigo-400 bg-indigo-500/10">{p.status}</span></td>
                    <td className="p-3 font-mono font-semibold text-emerald-400">${(p.budget || 0).toLocaleString()}</td>
                    <td className="p-3 font-bold text-red-400">{p.risk_score} / 100</td>
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => navigate(`/projects/${p.id}`)} className="text-gray-400 hover:text-indigo-400"><Eye className="w-4 h-4 inline" /></button>
                      <button onClick={() => setDeleteConfirmProject(p)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Card Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects List */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Active Projects ({filteredProjects.length})</h3>
            <div className="space-y-3">
              {filteredProjects.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-100 text-sm">{p.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        p.status === 'Delayed' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {p.status}
                      </span>
                      <button onClick={() => navigate(`/projects/${p.id}`)} className="p-1 text-gray-400 hover:text-indigo-400 transition"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setEditingProject(p); setProjectForm({ name: p.name, description: p.description || '', priority: p.priority || 'Medium', status: p.status || 'In Progress', budget: p.budget || 50000, department: p.department || 'Engineering', start_date: p.start_date || '', end_date: p.end_date || '' }); setShowProjectModal(true); }} className="p-1 text-gray-400 hover:text-indigo-400 transition"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteConfirmProject(p)} className="p-1 text-gray-400 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800/80">
                    <span>Dept: <strong className="text-gray-300">{p.department}</strong></span>
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" /> Risk: {p.risk_score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">AI Task Queue ({tasks.length})</h3>
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition flex items-start gap-3">
                  <button
                    onClick={() => handleTaskStatusToggle(t.id, t.status)}
                    className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition ${
                      t.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-600 hover:border-indigo-400'
                    }`}
                  >
                    {t.status === 'Completed' && <CheckSquare className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-semibold ${t.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {t.title}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          t.delay_prediction?.includes('Risk') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {t.delay_prediction}
                        </span>
                        <button onClick={() => navigate(`/tasks/${t.id}`)} className="p-1 text-gray-400 hover:text-indigo-400"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setEditingTask(t); setTaskForm({ project_id: t.project_id, title: t.title, description: t.description || '', priority: t.priority || 'Medium', status: t.status || 'To Do', due_date: t.due_date || '', estimated_hours: t.estimated_hours || 8 }); setShowTaskModal(true); }} className="p-1 text-gray-400 hover:text-indigo-400"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteConfirmTask(t)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{t.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-2">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {t.due_date}</span>
                      <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {t.assignee_name || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project Create / Edit Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-gray-100">{editingProject ? 'Edit Project' : 'Create Enterprise Project'}</h3>
            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">Priority</label>
                  <select
                    value={projectForm.priority}
                    onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-gray-200 focus:outline-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-gray-200 focus:outline-none"
                  >
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>Delayed</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowProjectModal(false)} className="px-4 py-2 rounded bg-gray-800 text-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold">{editingProject ? 'Save Changes' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 w-full max-w-sm space-y-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="text-sm font-bold text-gray-100">Delete Project?</h3>
            <p className="text-xs text-gray-400">Are you sure you want to delete <strong>{deleteConfirmProject.name}</strong>?</p>
            <div className="flex justify-center gap-3 pt-2 text-xs">
              <button onClick={() => setDeleteConfirmProject(null)} className="px-4 py-2 rounded bg-gray-800 text-gray-300">Cancel</button>
              <button onClick={() => handleDeleteProject(deleteConfirmProject.id)} className="px-4 py-2 rounded bg-red-600 text-white font-semibold">Delete Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
