import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, Bot, Sparkles, Clock } from 'lucide-react';

export const AIHistory = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/analytics');
        if (res.data.success) {
          const aiLogs = (res.data.auditLogs || []).filter(l => l.action.includes('AI') || l.resource.includes('AI'));
          setLogs(aiLogs);
        }
      } catch (err) {
        console.error('Error fetching AI history:', err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            AI Query & Interaction History
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Historical log of natural language prompts processed by Gemini AI.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
        {logs.length > 0 ? (
          logs.map((lg) => (
            <div key={lg.id} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-200 text-xs">{lg.details}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">By: {lg.user_name} | Action: {lg.action}</p>
              </div>
              <span className="text-[10px] text-gray-500">{new Date(lg.timestamp).toLocaleString()}</span>
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-500 p-4 text-center">No recent AI queries logged yet.</div>
        )}
      </div>
    </div>
  );
};
