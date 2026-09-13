import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../services/projects';
import { fetchProjectRepositories } from '../services/repositories';
import { fetchQualityInsights } from '../services/architecture';

import type { Project } from '../types/project';
import type { Repository } from '../types/repository';
import type { QualityInsightsResponse } from '../types/architecture';
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  FileCode,
  CheckCircle2,
  Loader2,
  FolderOpen,
} from 'lucide-react';

const Security: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>('');

  const [insights, setInsights] = useState<QualityInsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');

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
    setInsights(null);

    fetchProjectRepositories(selectedProjectId).then((repos) => {
      setRepositories(repos);
      if (repos.length > 0) {
        setSelectedRepoId(repos[0].id);
      }
    });
  }, [selectedProjectId]);

  // Load Security & Quality Insights when selected Repository changes
  useEffect(() => {
    if (!selectedRepoId) return;
    setLoading(true);
    setError(null);
    setInsights(null);

    fetchQualityInsights(selectedRepoId)
      .then((data) => setInsights(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedRepoId]);

  const filteredFindings = insights
    ? insights.security_findings.filter((f) => filterSeverity === 'ALL' || f.severity === filterSeverity)
    : [];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Security & Code Quality Audit</span>
          </h2>
          <p className="text-xs text-slate-500">
            Static vulnerability scanning, secret leak detection, and AST complexity ratings.
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

      {loading ? (
        <div className="bg-white border border-slate-200 p-12 rounded-xl text-center text-xs text-slate-500 space-y-3 shadow-xs">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
          <p>Scanning static code for secrets, unsafe calls, and complexity metrics...</p>
        </div>
      ) : insights ? (
        <div className="space-y-6">
          {/* Health Score Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-slate-500 text-xs font-mono block">Code Health Score</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-3xl font-extrabold font-mono ${
                    insights.health_score >= 80
                      ? 'text-emerald-600'
                      : insights.health_score >= 60
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {insights.health_score} / 100
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-slate-500 text-xs font-mono block">Critical Vulnerabilities</span>
              <span className="text-3xl font-extrabold font-mono text-red-600">
                {insights.critical_issues}
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-slate-500 text-xs font-mono block">Warning Issues</span>
              <span className="text-3xl font-extrabold font-mono text-amber-600">
                {insights.warning_issues}
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-slate-500 text-xs font-mono block">Total Code Lines</span>
              <span className="text-3xl font-extrabold font-mono text-blue-600">
                {insights.total_lines_of_code}
              </span>
            </div>
          </div>

          {/* Security Findings Section */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>Security Findings & Vulnerability Scan</span>
              </h3>

              <div className="flex gap-1.5 text-xs font-mono">
                {['ALL', 'CRITICAL', 'WARNING'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev as any)}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      filterSeverity === sev
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {insights.security_findings.length === 0 ? (
              <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-700 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="font-bold">✓ Zero Security Red Flags Detected</p>
                <p className="text-slate-600">No hardcoded API keys, secrets, or unsafe dynamic calls found.</p>
              </div>
            ) : filteredFindings.length === 0 ? (
              <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                No findings match the selected severity filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFindings.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {f.severity}
                        </span>
                        <span className="font-bold text-slate-900">{f.category}</span>
                      </div>

                      <span className="text-slate-500">
                        {f.file_path}:L{f.line_number}
                      </span>
                    </div>

                    <p className="text-slate-700 font-sans text-xs">{f.description}</p>

                    <div className="p-2.5 rounded bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                      <code>{f.snippet}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Complexity Grid */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-blue-600" />
              <span>File Complexity Metrics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {insights.file_complexity_metrics.map((fc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono shadow-xs"
                >
                  <div className="truncate space-y-0.5">
                    <span className="font-bold text-slate-900 block truncate">{fc.file_path}</span>
                    <span className="text-slate-500 text-[11px]">{fc.lines_of_code} LOC</span>
                  </div>

                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      fc.rating === 'HIGH'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : fc.rating === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    Complexity: {fc.complexity_score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
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

export default Security;
