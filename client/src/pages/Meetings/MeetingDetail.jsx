import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, ArrowLeft, Calendar, Mail, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const MeetingDetail = () => {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await api.get(`/meetings/${id}`);
        if (res.data.success) setMeeting(res.data.meeting);
      } catch (err) {
        console.error('Error fetching meeting detail:', err);
      }
    };
    fetchMeeting();
  }, [id]);

  if (!meeting) return <div className="p-8 text-xs text-indigo-400">Loading meeting transcript...</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <Link to="/meetings" className="inline-flex items-center gap-1 text-xs text-indigo-400 font-semibold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Meetings Intelligence Hub
      </Link>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            {meeting.title}
          </h1>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {meeting.date}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">AI Executive Briefing</h3>
          <div className="prose prose-invert max-w-none text-xs text-gray-300">
            <ReactMarkdown>{meeting.summary}</ReactMarkdown>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase">Raw Audio Transcript</h3>
          <p className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-400 font-mono">
            {meeting.transcript}
          </p>
        </div>
      </div>
    </div>
  );
};
