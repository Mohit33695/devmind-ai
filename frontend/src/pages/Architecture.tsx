import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../services/projects';
import { fetchProjectRepositories } from '../services/repositories';
import { fetchArchitectureGraph } from '../services/architecture';

import type { Project } from '../types/project';
import type { Repository } from '../types/repository';
import type { ArchitectureGraphResponse } from '../types/architecture';
import ArchitectureGraph from '../components/ArchitectureGraph';
import { GitFork, Loader2, AlertCircle, FolderOpen } from 'lucide-react';

const Architecture: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>('');

  const [graphData, setGraphData] = useState<ArchitectureGraphResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load Projects on Mount
  useEffect(() => {
    fetchProjects().then((data) => {
      setProjects(data.projects);
      if (data.projects.length > 0) {
        setSelectedProjectId(data.projects[0].id);
      }
    });
  }, []);

  // Load Repositories when selected Project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    setRepositories([]);
    setSelectedRepoId('');
    setGraphData(null);

    fetchProjectRepositories(selectedProjectId).then((repos) => {
      setRepositories(repos);
      if (repos.length > 0) {
        setSelectedRepoId(repos[0].id);
      }
    });
  }, [selectedProjectId]);

  // Load Graph Data when selected Repository changes
  useEffect(() => {
    if (!selectedRepoId) return;
    setLoading(true);
    setError(null);
    setGraphData(null);

    fetchArchitectureGraph(selectedRepoId)
      .then((gData) => setGraphData(gData))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedRepoId]);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <GitFork className="w-6 h-6 text-blue-600" />
            <span>Architecture Visualizer</span>
          </h2>
          <p className="text-xs text-slate-500">
            Interactive module dependency graph generated from Tree-sitter AST import statements.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              disabled={repositories.length === 0}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-50 min-w-[200px] transition-colors"
            >
              {repositories.length === 0 ? (
                <option value="">No Repositories Imported</option>
              ) : (
                repositories.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.total_files} files)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Canvas Area */}
      {loading ? (
        <div className="bg-white border border-slate-200 p-12 rounded-xl text-center text-xs text-slate-500 space-y-3 shadow-xs">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
          <p>Analyzing import relationships and building DAG nodes...</p>
        </div>
      ) : graphData ? (
        <ArchitectureGraph nodes={graphData.nodes} edges={graphData.edges} />
      ) : (
        <div className="bg-white border border-slate-200 p-12 rounded-xl text-center space-y-3 shadow-xs">
          <FolderOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900">No Repository Selected</h3>
          <p className="text-xs text-slate-500">Please import a repository from the Repository page.</p>
        </div>
      )}
    </div>
  );
};

export default Architecture;
