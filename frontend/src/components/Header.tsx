import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchHealthStatus, type HealthResponse } from '../services/api';
import { Cpu, Search, Bell, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

interface HeaderProps {
  name?: string;
}

const Header: React.FC<HeaderProps> = ({ name = 'Developer' }) => {
  const [apiHealth, setApiHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const location = useLocation();

  const checkHealth = () => {
    setLoading(true);
    fetchHealthStatus()
      .then((data) => {
        setApiHealth(data);
        setError(false);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Back to Home */}
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1">
                DevMind <span className="text-blue-600">AI</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-medium block -mt-1">
                Workspace
              </span>
            </div>
          </Link>

          {location.pathname !== '/' && (
            <Link
              to="/"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </Link>
          )}
        </div>

        {/* Center Search Modal Launcher */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search code symbols, files, or ask AI... (Ctrl+K)"
              readOnly
              onClick={() => alert('Quick search launcher (Ctrl+K) active. Type questions in Chat or Repository view!')}
              className="w-full pl-9 pr-12 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
            />
            <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200 shadow-xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* Backend API Health Status */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-sans text-[11px]">API:</span>
            {loading ? (
              <span className="flex items-center space-x-1.5 text-amber-600 text-[11px] font-sans font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <span>Checking</span>
              </span>
            ) : error ? (
              <span className="flex items-center space-x-1 text-red-600 text-[11px] font-sans font-medium">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                <span>Disconnected</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-600 text-[11px] font-sans font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Online (v{apiHealth?.version || '0.1.0'})</span>
              </span>
            )}
          </div>

          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          <div className="h-5 w-px bg-slate-200" />

          {/* User Profile */}
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-slate-700 hidden lg:inline">{name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;