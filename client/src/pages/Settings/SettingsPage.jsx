import React, { useState } from 'react';
import { Settings, Shield, Cpu, Bell, Database } from 'lucide-react';

export const SettingsPage = () => {
  const [model, setModel] = useState('Gemini 1.5 Flash');
  const [temperature, setTemperature] = useState(0.2);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Enterprise System & AI Settings
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Configure Gemini model settings, API rate limits, and security governance rules.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          Gemini AI Engine Configuration
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Target Model Variant</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-gray-200 focus:outline-none"
            >
              <option>Gemini 1.5 Flash (Ultra Fast)</option>
              <option>Gemini 1.5 Pro (Deep Reasoning)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1">Creativity / Temperature ({temperature})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={() => alert('AI Settings Saved Successfully!')}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
          >
            Save System Configurations
          </button>
        </div>
      </div>
    </div>
  );
};
