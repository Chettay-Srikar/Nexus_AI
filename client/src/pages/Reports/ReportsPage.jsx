import React, { useState } from 'react';
import api from '../../services/api';
import { 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  Calendar, 
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('Weekly Department Performance');
  const [format, setFormat] = useState('PDF');
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert(`NexusAI ${reportType} generated successfully in ${format} format!`);
    }, 1500);
  };

  const pastReports = [
    { title: 'Q2 Financial & Budget Audit', date: '2026-08-01', format: 'PDF', author: 'Executive Desk' },
    { title: 'Engineering Sprint Efficiency Report', date: '2026-07-28', format: 'CSV', author: 'Alex Rivera' },
    { title: 'HR SOC2 Employee Training Compliance', date: '2026-07-20', format: 'PDF', author: 'Elena Rostova' }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            AI Executive Report Generator
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Synthesize raw multi-department data into polished PDF/CSV executive summaries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Form */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Configure Report Parameters</h3>

          <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Report Preset</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-indigo-500"
              >
                <option>Weekly Department Performance</option>
                <option>Monthly Executive Financial Summary</option>
                <option>Project Risk & Bottleneck Analysis</option>
                <option>HR Employee Productivity & Leave Audit</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {['PDF', 'CSV', 'Excel'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    className={`py-2 rounded-lg font-bold border transition ${
                      format === fmt
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
            >
              {generating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Gemini Report...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate & Export Report</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Reports List */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Recently Generated Reports</h3>
          <div className="space-y-3">
            {pastReports.map((rp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between hover:border-gray-700 transition">
                <div>
                  <h4 className="font-semibold text-gray-200 text-xs">{rp.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Author: {rp.author} | Generated: {rp.date}</p>
                </div>
                <button
                  onClick={() => alert(`Downloading ${rp.title}.${rp.format.toLowerCase()}`)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{rp.format}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
