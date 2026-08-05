import React from 'react';
import { HelpCircle, BookOpen, MessageSquare, Shield, Mail } from 'lucide-react';

export const HelpCenter = () => {
  const faqs = [
    { q: 'How does Gemini AI integrate with company documents?', a: 'All documents uploaded to Document Intelligence are ingested into server-side vector representations for contextual entity extraction and zero-retention analysis.' },
    { q: 'Can I export custom executive reports to PDF and CSV?', a: 'Yes! Navigate to the Reports section to generate weekly and monthly AI syntheses in PDF, CSV, or Excel formats.' },
    { q: 'How do automated AI triggers work?', a: 'Workflows monitor system events (e.g. overdue tasks or meeting uploads) and automatically execute condition rules such as calendar updates or manager notifications.' }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          NexusAI Help Center & Enterprise Documentation
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Learn how to maximize organizational productivity using NexusAI Enterprise OS.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-2">
              <h4 className="font-semibold text-gray-200 text-xs">{f.q}</h4>
              <p className="text-xs text-gray-400">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
