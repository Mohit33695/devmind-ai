import React, { useState } from 'react';
import type { Project } from '../types/project';
import { FolderGit2, Trash2, ArrowRight, Calendar, Layers, MoreVertical } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onSelect: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onSelect }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {project.name}
              </h3>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-sans">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Updated {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 animate-fadeIn">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(project.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {project.description || 'No description provided for this software project workspace.'}
        </p>
      </div>

      {/* Footer & Select Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
          <Layers className="w-3 h-3 text-slate-500" />
          <span>{project.repository_count || 0} Repositories</span>
        </span>

        <button
          onClick={() => onSelect(project)}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
