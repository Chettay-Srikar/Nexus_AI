import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ReactMarkdown from 'react-markdown';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Download,
  History,
  Pin,
  FileText,
  Paperclip
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export const AICommandCenter = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `### 👋 Welcome to NexusAI Command Center, **${user?.name}**!\n\nI am connected to your enterprise systems including **Engineering**, **HR**, **Marketing**, and **Support**.\n\nYou can ask me questions like:\n- *"Which projects are delayed?"*\n- *"Summarize today's executive meetings."*\n- *"What are our biggest departmental risks?"*\n- *"Who is overloaded with critical tasks this week?"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Which projects are delayed?",
    "Summarize today's meetings.",
    "What are our biggest risks?",
    "Generate executive summary."
  ];

  const pinnedConversations = [
    { title: 'Q3 Marketing Rebrand Risk Analysis', date: 'Yesterday' },
    { title: 'Cloud Migration Contractor Headcount Review', date: '2 days ago' },
    { title: 'SOC2 Audit Compliance Summary', date: 'Aug 03' }
  ];

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleExportChat = () => {
    const transcript = messages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n`).join('\n---\n\n');
    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexusAI_Chat_Transcript_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  const handleClearHistory = () => {
    setMessages([
      {
        sender: 'ai',
        text: `### 🤖 Conversation Cleared.\n\nAsk any enterprise question to start a fresh Gemini AI analysis session.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSubmit = async (queryText) => {
    const query = queryText || prompt;
    if (!query.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/ai/command-center', { prompt: query });
      const aiData = res.data.data || res.data;
      const aiMsg = {
        sender: 'ai',
        text: aiData.text || aiData.answer || 'Query processed.',
        structuredData: aiData.structuredData,
        source: aiData.source || 'gemini-1.5-flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Command center error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '❌ **Error executing enterprise AI query.** Please check backend server status.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] p-6 gap-4">
      {/* Pinned History Drawer Sidebar */}
      {showHistory && (
        <div className="w-64 glass-panel p-4 rounded-xl border border-gray-800 space-y-4 flex flex-col justify-between shrink-0">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-indigo-400" /> Pinned AI Chats
            </h3>
            <div className="space-y-2">
              {pinnedConversations.map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-700 text-xs cursor-pointer transition">
                  <p className="font-semibold text-gray-200 truncate">{c.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{c.date}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleClearHistory}
            className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center justify-center gap-2 border border-gray-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Session</span>
          </button>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Header Info */}
        <div className="flex items-center justify-between glass-panel p-4 rounded-xl border border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              title="Toggle Pinned History Drawer"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
            >
              <History className="w-4 h-4" />
            </button>
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-100 flex items-center gap-2">
                Enterprise AI Command Center
                <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Gemini 1.5 Active
                </span>
              </h2>
              <p className="text-xs text-gray-400">Contextual Reasoning, Data Visualization & Executive Insights</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportChat}
              title="Export Conversation Transcript"
              aria-label="Export conversation transcript"
              className="px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Chat</span>
            </button>

            <div className="hidden lg:flex items-center gap-2">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(qp)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-800/60 hover:bg-indigo-600/20 hover:text-indigo-300 border border-gray-700 text-gray-300 transition"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-xl p-4 text-sm leading-relaxed relative group ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-lg'
                    : 'glass-panel text-gray-200 border border-gray-800 rounded-bl-none'
                }`}
              >
                <ReactMarkdown className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-indigo-300">
                  {msg.text}
                </ReactMarkdown>

                {msg.sender === 'ai' && (
                  <button
                    onClick={() => handleCopyText(msg.text, idx)}
                    aria-label="Copy AI response"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded bg-gray-800/80 text-gray-400 hover:text-white transition"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}

                {msg.structuredData && (
                  <div className="mt-4 p-4 rounded-lg bg-gray-900/80 border border-gray-800">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                      {msg.structuredData.chartTitle || 'Enterprise Visualization'}
                    </h4>

                    {msg.structuredData.chartType === 'bar' && (
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={msg.structuredData.data}>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                            <YAxis stroke="#9ca3af" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                            <Bar dataKey="risk" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {msg.structuredData.chartType === 'pie' && (
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={msg.structuredData.data}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              dataKey="value"
                              paddingAngle={5}
                            >
                              {msg.structuredData.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 text-[10px] text-gray-500 flex items-center justify-between">
                  <span>{msg.timestamp}</span>
                  {msg.source && <span className="uppercase text-[9px] text-indigo-400 font-semibold">{msg.source}</span>}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-gray-400 text-xs p-3 glass-panel rounded-xl border border-gray-800 w-fit">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Gemini Enterprise Reasoning Engine calculating cross-department analytics...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="glass-panel p-2 rounded-xl border border-gray-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything (e.g. 'Which invoices are overdue?' or 'Summarize today's meetings')..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
            >
              <span>Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
