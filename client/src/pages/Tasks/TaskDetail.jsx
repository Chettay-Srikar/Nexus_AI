import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { CheckSquare, ArrowLeft, Clock, AlertTriangle, UserCheck, Send, MessageSquare } from 'lucide-react';

export const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskDetail();
  }, [id]);

  const fetchTaskDetail = async () => {
    try {
      const res = await api.get(`/tasks/${id}`);
      const data = res.data.data || res.data;
      if (data.task) {
        setTask(data.task);
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching task detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/tasks/${id}/comments`, { comment: newComment });
      const data = res.data.data || res.data;
      if (data.comments) {
        setComments(data.comments);
        setNewComment('');
      }
    } catch (err) {
      alert('Failed to post comment');
    }
  };

  if (loading) return <div className="p-8 text-xs text-indigo-400">Loading task detail...</div>;
  if (!task) return <div className="p-8 text-xs text-red-400">Task not found.</div>;

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <Link to="/projects" className="inline-flex items-center gap-1 text-xs text-indigo-400 font-semibold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Project & Task Queue
      </Link>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            {task.title}
          </h1>
          <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 font-semibold">
            {task.status}
          </span>
        </div>

        <p className="text-xs text-gray-300">{task.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-800 text-xs">
          <div>
            <span className="text-gray-500 block">Project</span>
            <span className="font-semibold text-gray-200">{task.project_name}</span>
          </div>
          <div>
            <span className="text-gray-500 block">AI Delay Prediction</span>
            <span className="font-semibold text-red-400">{task.delay_prediction}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Assignee</span>
            <span className="font-semibold text-gray-200">{task.assignee_name || 'Unassigned'}</span>
          </div>
        </div>
      </div>

      {/* Task Comments Thread */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" /> Task Discussion & Activity Log ({comments.length})
        </h3>

        <form onSubmit={handleAddComment} className="flex gap-2 text-xs">
          <input
            type="text"
            placeholder="Add a comment or updates to this task..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1.5">
            <span>Post</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="space-y-3 pt-2">
          {comments.map((c) => (
            <div key={c.id} className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="font-semibold text-indigo-400">{c.user_name || 'User'}</span>
                <span className="text-[10px] text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="text-gray-200">{c.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
