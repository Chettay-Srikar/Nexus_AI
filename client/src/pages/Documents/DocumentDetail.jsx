import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { FileText, ArrowLeft, Download, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const DocumentDetail = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/documents/${id}`);
        if (res.data.success) setDocument(res.data.document);
      } catch (err) {
        console.error('Error fetching document detail:', err);
      }
    };
    fetchDoc();
  }, [id]);

  if (!document) return <div className="p-8 text-xs text-indigo-400">Loading document intelligence...</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <Link to="/documents" className="inline-flex items-center gap-1 text-xs text-indigo-400 font-semibold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Documents Hub
      </Link>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            {document.title}
          </h1>
          <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 font-mono font-bold">
            {document.file_type}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Gemini AI Executive Summary
          </h3>
          <div className="prose prose-invert max-w-none text-xs text-gray-300">
            <ReactMarkdown>{document.summary || document.content_text}</ReactMarkdown>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase">Original Ingested Text</h3>
          <pre className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-400 font-mono overflow-x-auto max-h-96">
            {document.content_text}
          </pre>
        </div>
      </div>
    </div>
  );
};
