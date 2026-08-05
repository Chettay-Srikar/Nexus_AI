import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Search, 
  Layers, 
  Clock,
  CheckCircle,
  FileCheck
} from 'lucide-react';

export const DocumentIntelligence = () => {
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      if (res.data.success) setDocuments(res.data.documents);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleProcessDocument = async (e) => {
    e.preventDefault();
    if (!textContent.trim() || processing) return;

    setProcessing(true);
    try {
      const res = await api.post('/ai/document-intelligence', {
        title: title || 'Enterprise Policy Doc',
        textContent
      });

      if (res.data.success) {
        setActiveAnalysis(res.data.analysis);
        setTitle('');
        setTextContent('');
        fetchDocuments();
      }
    } catch (err) {
      alert('Error processing document intelligence');
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
            <FileText className="w-5 h-5 text-indigo-400" />
            Document Intelligence Hub
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Extract entities, key deadlines, FAQs, and executive summaries from unstructured company text.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Upload & Ingestion */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-400" />
            Ingest & Analyze Document Text
          </h3>

          <form onSubmit={handleProcessDocument} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Document Title</label>
              <input
                type="text"
                placeholder="e.g. Q3 SOC2 Security Policy & SLA Guidelines"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Paste Document Content / Policy / FAQ</label>
              <textarea
                rows={8}
                required
                placeholder="Paste contract text, PDF content, policies, or SLAs here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={processing || !textContent.trim()}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
            >
              {processing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Gemini AI Parsing Document...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Document Intelligence</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live AI Analysis Results / Extracted Knowledge */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Extracted Knowledge & Entities
          </h3>

          {activeAnalysis ? (
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold pb-2 border-b border-gray-800">
                <span>Status: Gemini Processed</span>
                <span>Source: {activeAnalysis.source}</span>
              </div>
              <div className="prose prose-invert max-w-none text-xs text-gray-300">
                <ReactMarkdown>{activeAnalysis.text}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-64 border border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-500 space-y-2 text-xs">
              <Layers className="w-8 h-8 text-gray-600" />
              <p>Submit a document on the left to extract deadlines, action items, and summaries.</p>
            </div>
          )}
        </div>
      </div>

      {/* Indexed Enterprise Documents Repository */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Indexed Enterprise Documents ({documents.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-indigo-500/40 transition space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-200 text-xs truncate">{doc.title}</h4>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                  {doc.file_type}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 line-clamp-3">{doc.summary || doc.content_text}</p>
              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-gray-800">
                <span>By: {doc.uploader_name || 'System'}</span>
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
