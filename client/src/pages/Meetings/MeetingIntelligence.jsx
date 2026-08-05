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

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await api.get('/meetings');
      if (res.data.success) setMeetings(res.data.meetings);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };

  const handleProcessMeeting = async (e) => {
    e.preventDefault();
    if (!transcript.trim() || processing) return;

    setProcessing(true);
    try {
      const res = await api.post('/ai/meeting-intelligence', {
        title: title || 'Executive Strategy Sync',
        date: date || new Date().toISOString().split('T')[0],
        transcript
      });

      if (res.data.success) {
        setActiveAnalysis(res.data.analysis);
        setTitle('');
        setTranscript('');
        fetchMeetings();
      }
    } catch (err) {
      alert('Error processing meeting transcript');
    } finally {
      setProcessing(false);
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
                placeholder="Sarah: Welcome team... Marcus: We finished the API gateway rate limiting... Elena: We need signoff on budget."
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
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-4">
              <div className="prose prose-invert max-w-none text-xs text-gray-300">
                <ReactMarkdown>{activeAnalysis.text}</ReactMarkdown>
              </div>

              <div className="pt-3 border-t border-gray-800 flex gap-2">
                <button
                  onClick={() => alert('Drafting automated follow-up email to all meeting attendees...')}
                  className="px-3 py-1.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition"
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

      {/* Historical Meetings List */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Processed Enterprise Meetings ({meetings.length})</h3>
        <div className="space-y-3">
          {meetings.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-200 text-sm">{m.title}</h4>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {m.date}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono bg-gray-950 p-2.5 rounded border border-gray-800 line-clamp-2">
                {m.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
