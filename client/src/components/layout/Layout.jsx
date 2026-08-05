import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Bot, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Briefcase, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  Bell, 
  Search,
  Sparkles,
  BookOpen,
  FileSpreadsheet,
  Building,
  HelpCircle,
  History,
  Settings,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'AI Command Center', path: '/ai', icon: Bot, badge: 'Gemini 1.5' },
    { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects & Tasks', path: '/projects', icon: Briefcase },
    { label: 'Document Intelligence', path: '/documents', icon: FileText },
    { label: 'Meeting Intelligence', path: '/meetings', icon: Users },
    { label: 'Knowledge Hub', path: '/knowledge', icon: BookOpen },
    { label: 'AI Workflows', path: '/workflows', icon: Zap },
    { label: 'Business Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Executive Reports', path: '/reports', icon: FileSpreadsheet },
    { label: 'User Directory', path: '/users', icon: UserCheck, roles: ['Administrator', 'Executive', 'Manager'] },
    { label: 'Departments', path: '/departments', icon: Building, roles: ['Administrator', 'Executive'] },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Audit Logs', path: '/audit', icon: ShieldCheck, roles: ['Administrator', 'Executive'] },
    { label: 'AI History', path: '/history', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Help Center', path: '/help', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-gray-800 flex flex-col justify-between h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <NavLink to="/" className="h-16 flex items-center px-6 border-b border-gray-800 gap-3 hover:opacity-90 transition">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              Nexus<span className="text-indigo-400">AI</span>
            </h1>
            <p className="text-[10px] text-gray-400 tracking-wider uppercase font-semibold">Enterprise OS</p>
          </div>
        </NavLink>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            if (item.roles && !item.roles.includes(user?.role)) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-semibold px-1.5 py-0.5 rounded border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-800 bg-[#0b0f19]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/60 border border-gray-800">
          <NavLink to="/profile" className="flex items-center gap-2.5 overflow-hidden hover:opacity-80 transition">
            <img
              src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
              alt={user?.name}
              className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-gray-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-indigo-400 font-medium truncate">{user?.role}</p>
            </div>
          </NavLink>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search?query=${encodeURIComponent(searchTerm)}`);
        const data = res.data.data?.results || res.data.results || [];
        setSearchResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectResult = (resItem) => {
    setShowDropdown(false);
    setSearchTerm('');
    if (resItem.type === 'Project') navigate(`/projects/${resItem.id}`);
    else if (resItem.type === 'Task') navigate(`/tasks/${resItem.id}`);
    else if (resItem.type === 'Document') navigate(`/documents/${resItem.id}`);
    else if (resItem.type === 'Meeting') navigate(`/meetings/${resItem.id}`);
    else navigate('/projects');
  };

  return (
    <header className="h-16 bg-[#0d1322]/80 backdrop-blur-md border-b border-gray-800 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search with Live Results Dropdown */}
      <div className="relative w-96">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ask AI or search enterprise resources (Ctrl + K)..."
          className="w-full bg-gray-900/80 border border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
        />

        {showDropdown && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-2 z-50 space-y-1">
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelectResult(r)}
                className="w-full p-2 rounded-lg hover:bg-gray-800/80 text-left flex items-center justify-between text-xs transition"
              >
                <span className="font-semibold text-gray-200 truncate">{r.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">{r.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <NavLink to="/notifications" className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
        </NavLink>
        <div className="px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-xs text-gray-300">
          {user?.department} Dept
        </div>
      </div>
    </header>
  );
};
