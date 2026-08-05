import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Zap, 
  Play, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const WorkflowAutomation = () => {
  const [workflows, setWorkflows] = useState([]);
  const [triggeringId, setTriggeringId] = useState(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await api.get('/workflows');
      if (res.data.success) setWorkflows(res.data.workflows);
    } catch (err) {
      console.error('Error fetching workflows:', err);
    }
  };

  const handleTestTrigger = async (id) => {
    setTriggeringId(id);
    try {
      const res = await api.post(`/workflows/${id}/trigger`);
      if (res.data.success) {
        alert(res.data.message);
        fetchWorkflows();
      }
    } catch (err) {
      alert('Error triggering workflow automation');
    } finally {
      setTriggeringId(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            AI Workflow Automation Engine
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Automate cross-departmental operations: Trigger -&gt; Gemini Reasoning -&gt; Action Execution.</p>
        </div>
      </div>

      {/* Visual Workflow Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((wf) => (
          <div key={wf.id} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {wf.status}
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Executed: {wf.execution_count}x
                </span>
              </div>

              <h3 className="font-bold text-gray-100 text-sm">{wf.title}</h3>

              {/* Visual Trigger -> Action Flow */}
              <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Trigger Event</span>
                  <span className="text-gray-300 font-semibold">{wf.trigger_type}</span>
                </div>
                <div className="flex justify-center text-gray-600">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Automated Action</span>
                  <span className="text-gray-300 font-semibold">{wf.action_type}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
              <span className="text-[10px] text-gray-500">Last Run: {wf.last_run || 'Never'}</span>
              <button
                onClick={() => handleTestTrigger(wf.id)}
                disabled={triggeringId === wf.id}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                {triggeringId === wf.id ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Test Trigger</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
