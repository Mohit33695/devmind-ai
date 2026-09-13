import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  MessageSquareCode,
  GitFork,
  ShieldCheck,
  TestTube2,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/repository', label: 'Repositories', icon: FolderGit2 },
  { path: '/chat', label: 'AI Chat', icon: MessageSquareCode },
  { path: '/architecture', label: 'Architecture', icon: GitFork },
  { path: '/security', label: 'Security & Audit', icon: ShieldCheck },
  { path: '/testing', label: 'Tests & Health', icon: TestTube2 },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-57px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* Nav Category Label */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspaces
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>DevMind AI Platform</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <p className="text-[11px] text-slate-500">FastAPI & Vector Engine Ready</p>
      </div>
    </aside>
  );
};

export default Sidebar;