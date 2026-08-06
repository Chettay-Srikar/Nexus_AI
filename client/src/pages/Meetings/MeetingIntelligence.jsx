import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ReactMarkdown from 'react-markdown';
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Mail, 
  Calendar, 
  ListOrdered,
  Plus
} from 'lucide-react';

export const MeetingIntelligence = () => {
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await api.get('/meetings');
      if (res.data?.success) setMeetings(res.data.data?.meetings ?? res.data.meetings ?? []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };

  const handleProcessMeeting = async (e) => {
    e.preventDefault();
    if (!transcript.trim() || processing) return;

    setProcessing(true);
    const payload = {
      title: title || 'Executive Strategy Sync',
      meetingDate: date || new Date().toISOString().split('T')[0],
      date: date || new Date().toISOString().split('T')[0],
      transcript
    };

    console.log("Submitting meeting:", payload);

    try {
      const res = await api.post('/ai/meeting-intelligence', payload);
      console.log("Meeting Response:", res.data);

      if (res.data?.success) {
        const analysis = res.data.data?.analysis ?? res.data.analysis;
        setActiveAnalysis(analysis);
        setTitle('');
        setTranscript('');
        fetchMeetings();
      }
    } catch (err) {
      console.error('Meeting intelligence error:', err);
      alert('Error processing meeting transcript');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await api.delete(`/meetings/${meetingId}`);
      setMeetings(prev => prev.filter(m => m.id !== meetingId));
    } catch (err) {
      console.error('Delete meeting error:', err);
      alert('Failed to delete meeting');
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Meeting Intelligence Hub
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Transform raw meeting transcripts into executive decisions, task assignments, and follow-up emails.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcript Form */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            Ingest Meeting Transcript
          </h3>

          <form onSubmit={handleProcessMeeting} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Sprint Planning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Meeting Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Paste Raw Transcript or Speaker Notes</label>
              <textarea
                rows={8}
                required
                placeholder="Sarah: Welcome team... Marcus: We finished the API gateway rate limiting... David: We need signoff on budget."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-gray-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={processing || !transcript.trim()}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
            >
              {processing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Gemini Extracting Decisions & Tasks...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Meeting Intelligence</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Analysis Display */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            AI Executive Briefing & Action Plan
          </h3>

          {activeAnalysis ? (
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-4 overflow-y-auto max-h-[520px]">
              <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold pb-2 border-b border-gray-800">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Status: Gemini Processed</span>
                <span>Source: {activeAnalysis.source || 'Gemini'} | Confidence: {activeAnalysis.confidence || 0.97}</span>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Executive Summary</h4>
                <p className="text-xs text-gray-200 bg-gray-800/60 p-3 rounded-lg border border-gray-700/60 leading-relaxed">
                  {activeAnalysis.executiveSummary || activeAnalysis.summary || activeAnalysis.text}
                </p>
              </div>

              {/* Key Decisions */}
              {Array.isArray(activeAnalysis.keyDecisions) && activeAnalysis.keyDecisions.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Key Strategic Decisions</h4>
                  <ul className="space-y-1">
                    {activeAnalysis.keyDecisions.map((dec, idx) => (
                      <li key={idx} className="text-xs text-gray-200 flex items-start gap-2 bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{dec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items & Assigned Tasks */}
              {Array.isArray(activeAnalysis.assignedTasks) && activeAnalysis.assignedTasks.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Assigned Action Items</h4>
                  <div className="space-y-1.5">
                    {activeAnalysis.assignedTasks.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-gray-800/60 border border-gray-700/60 text-xs flex items-center justify-between">
                        <span className="text-gray-200">{item.task || item}</span>
                        {item.assignee && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {item.assignee}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Action Items */}
              {Array.isArray(activeAnalysis.actionItems) && activeAnalysis.actionItems.length > 0 && (!activeAnalysis.assignedTasks || activeAnalysis.assignedTasks.length === 0) && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Action Items</h4>
                  <ul className="space-y-1">
                    {activeAnalysis.actionItems.map((act, idx) => (
                      <li key={idx} className="text-xs text-gray-300 bg-gray-800/40 p-2 rounded-md">
                        • {act}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Identified Risks & Blockers */}
              {Array.isArray(activeAnalysis.risks) && activeAnalysis.risks.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Identified Risks & Blockers</h4>
                  <div className="space-y-1">
                    {activeAnalysis.risks.map((risk, idx) => (
                      <div key={idx} className="p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                        ⚠️ {risk}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Participants & Deadlines */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
                {Array.isArray(activeAnalysis.participants) && activeAnalysis.participants.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Participants</h5>
                    <div className="flex flex-wrap gap-1">
                      {activeAnalysis.participants.map((p, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300 border border-gray-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(activeAnalysis.deadlines) && activeAnalysis.deadlines.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Deadlines</h5>
                    <div className="flex flex-wrap gap-1">
                      {activeAnalysis.deadlines.map((dl, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                          {dl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Follow-up Email Button (Only enabled when activeAnalysis exists) */}
              <div className="pt-3 border-t border-gray-800 flex gap-2">
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Draft Follow-up Email
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 border border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-500 space-y-2 text-xs">
              <ListOrdered className="w-8 h-8 text-gray-600" />
              <p>Paste a transcript on the left to extract decisions and auto-assign tasks.</p>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Email Modal */}
      {showEmailModal && activeAnalysis && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 max-w-xl w-full space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" /> Executive Follow-up Email Draft
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-200 text-xs font-bold px-2 py-1 bg-gray-800 rounded"
              >
                ✕
              </button>
            </div>
            <textarea
              readOnly
              rows={10}
              value={activeAnalysis.followUpEmail || 'Subject: Meeting Follow-up\n\nHi Team,\n\nHere is a summary of decisions and action items...'}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3.5 text-xs text-gray-200 font-mono leading-relaxed focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeAnalysis.followUpEmail || '');
                  alert('Follow-up email copied to clipboard!');
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Meetings List */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Processed Enterprise Meetings ({(Array.isArray(meetings) ? meetings : []).length})</h3>
        <div className="space-y-3">
          {(Array.isArray(meetings) ? meetings : []).map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition space-y-2 relative group">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-200 text-sm">{m.title}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {m.meeting_date || m.date || (m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recent')}
                  </span>
                  <button
                    onClick={() => handleDeleteMeeting(m.id)}
                    className="text-gray-500 hover:text-red-400 transition text-xs"
                    title="Delete Meeting"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-300 font-mono bg-gray-950 p-2.5 rounded border border-gray-800 line-clamp-2">
                {m.summary || m.transcript}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
