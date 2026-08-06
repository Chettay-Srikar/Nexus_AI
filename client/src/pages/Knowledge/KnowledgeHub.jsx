import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  BookOpen, 
  Search, 
  Tag, 
  FileText, 
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const KnowledgeHub = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    try {
      const res = await api.get('/knowledge');
      console.log("Knowledge API Response:", res.data);
      const data = res.data.data?.items ?? res.data.items ?? [];
      setItems(data);
      console.log("Knowledge State:", data);
    } catch (err) {
      console.error('Error fetching knowledge hub:', err);
    }
  };

  const categories = ['All', 'Security', 'Engineering', 'HR', 'Support'];

  const filteredItems = (Array.isArray(items) ? items : []).filter(it => {
    const matchesCategory = selectedCategory === 'All' || it.category === selectedCategory;
    const matchesSearch = (it.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (it.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header & Global Search */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Enterprise Knowledge Hub & Deep Search
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Instant AI vector search across policies, SLAs, engineering docs, and HR manuals.</p>
        </div>

        <div className="relative max-w-2xl">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies, SLAs, architectural guidelines (e.g. 'SOC2', 'PTO', 'gRPC')..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3 hover:border-gray-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {item.category}
              </span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <Tag className="w-3 h-3" /> {item.tags}
              </span>
            </div>

            <h3 className="font-bold text-gray-100 text-sm">{item.title}</h3>
            <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/60 p-3 rounded-xl border border-gray-800">
              {item.content}
            </p>

            <div className="flex items-center justify-between text-[11px] text-indigo-400 pt-1 font-semibold cursor-pointer hover:underline">
              <span>Ask Gemini AI about this policy</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
