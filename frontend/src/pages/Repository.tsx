import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../services/projects';
import {
  fetchProjectRepositories,
  fetchFileTree,
  fetchFileContent,
  deleteRepository,
} from '../services/repositories';
import { parseRepositoryAST, fetchRepositorySymbols } from '../services/parser';

import type { Project } from '../types/project';
import type { Repository as RepoType, FileTreeResponse, FileContentResponse } from '../types/repository';
import type { ASTSymbol } from '../types/parser';

import ImportRepoModal from '../components/ImportRepoModal';
import FileTree from '../components/FileTree';
import CodeViewer from '../components/CodeViewer';
import SymbolExplorer from '../components/SymbolExplorer';
import ReadmeGenerator from '../components/ReadmeGenerator';
import {
  FolderGit2,
  FileCode,
  Layers,
  FileText,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';

const RepositoryView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [repositories, setRepositories] = useState<RepoType[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'files' | 'symbols' | 'readme'>('files');

  const [fileTreeData, setFileTreeData] = useState<FileTreeResponse | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [fileContentData, setFileContentData] = useState<FileContentResponse | null>(null);

  const [symbols, setSymbols] = useState<ASTSymbol[]>([]);

  const [loadingRepos, setLoadingRepos] = useState<boolean>(false);
  const [loadingTree, setLoadingTree] = useState<boolean>(false);
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [parsingAST, setParsingAST] = useState<boolean>(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
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
    setLoadingRepos(true);
    setError(null);
    setRepositories([]);
    setSelectedRepoId('');
    setFileTreeData(null);
    setFileContentData(null);

    fetchProjectRepositories(selectedProjectId)
      .then((repos) => {
        setRepositories(repos);
        if (repos.length > 0) {
          setSelectedRepoId(repos[0].id);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingRepos(false));
  }, [selectedProjectId]);

  // Load File Tree & Symbols when selected Repository changes
  useEffect(() => {
    if (!selectedRepoId) return;
    setLoadingTree(true);
    setFileTreeData(null);
    setFileContentData(null);
    setSelectedFilePath('');

    fetchFileTree(selectedRepoId)
      .then((tree) => setFileTreeData(tree))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingTree(false));

    loadSymbols(selectedRepoId);
  }, [selectedRepoId]);

  const loadSymbols = (repoId: string) => {
    fetchRepositorySymbols(repoId)
      .then((res) => setSymbols(res.symbols))
      .catch(() => setSymbols([]));
  };

  const handleTriggerParse = async () => {
    if (!selectedRepoId) return;
    setParsingAST(true);
    setError(null);
    try {
      await parseRepositoryAST(selectedRepoId);
      await loadSymbols(selectedRepoId);
    } catch (err: any) {
      setError(err?.message || 'Failed to parse AST code symbols.');
    } finally {
      setParsingAST(false);
    }
  };

  const handleFileSelect = (path: string) => {
    if (!selectedRepoId || !path) return;
    setSelectedFilePath(path);
    setActiveTab('files');
    setLoadingContent(true);

    fetchFileContent(selectedRepoId, path)
      .then((contentResp) => {
        setFileContentData(contentResp);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingContent(false));
  };

  const handleSymbolSelect = (filePath: string) => {
    handleFileSelect(filePath);
  };

  const handleRepoImported = (newRepo: RepoType) => {
    setRepositories((prev) => [newRepo, ...prev]);
    setSelectedRepoId(newRepo.id);
  };

  const handleDeleteRepo = async (id: string) => {
    if (!confirm('Delete repository and remove extracted source files?')) return;
    try {
      await deleteRepository(id);
      const updated = repositories.filter((r) => r.id !== id);
      setRepositories(updated);
      if (selectedRepoId === id) {
        setSelectedRepoId(updated.length > 0 ? updated[0].id : '');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const selectedRepoName = repositories.find((r) => r.id === selectedRepoId)?.name || 'Repository';

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Controls Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Workspace Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {projects.length === 0 ? (
                <option value="">No Projects Available</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.repository_count} repos)
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Repository
            </label>
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              disabled={repositories.length === 0}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-50 min-w-[200px] transition-colors"
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

        {/* Tab Mode Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'files'
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code Viewer</span>
            </button>
            <button
              onClick={() => setActiveTab('symbols')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'symbols'
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>AST Symbols ({symbols.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('readme')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'readme'
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>README Docs</span>
            </button>
          </div>

          {selectedRepoId && (
            <button
              onClick={() => handleDeleteRepo(selectedRepoId)}
              title="Delete Repository"
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsImportModalOpen(true)}
            disabled={!selectedProjectId}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Import Repo</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace Explorer Area */}
      {!selectedProjectId ? (
        <div className="bg-white border border-slate-200 p-12 rounded-xl text-center space-y-3 shadow-xs">
          <FolderOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900">No Active Workspace</h3>
          <p className="text-xs text-slate-500">Please create a project first from the Dashboard.</p>
        </div>
      ) : repositories.length === 0 && !loadingRepos ? (
        <div className="bg-white border border-slate-200 p-12 rounded-xl text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FolderGit2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Repositories Imported Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Upload a `.ZIP` archive or clone a public GitHub repository to scan files and generate the source code tree.
          </p>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
          >
            + Import Your First Repository
          </button>
        </div>
      ) : activeTab === 'readme' ? (
        <ReadmeGenerator repositoryId={selectedRepoId} repositoryName={selectedRepoName} />
      ) : activeTab === 'symbols' ? (
        <SymbolExplorer
          symbols={symbols}
          loading={parsingAST}
          onParseTrigger={handleTriggerParse}
          onSymbolSelect={handleSymbolSelect}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
          {/* File Tree Sidebar */}
          <div className="md:col-span-1">
            {loadingTree ? (
              <div className="bg-white border border-slate-200 p-6 rounded-xl text-xs text-slate-500 flex items-center space-x-2 shadow-xs">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span>Scanning File Tree...</span>
              </div>
            ) : fileTreeData ? (
              <FileTree
                node={fileTreeData.file_tree}
                selectedFilePath={selectedFilePath}
                onFileSelect={handleFileSelect}
              />
            ) : (
              <div className="bg-white border border-slate-200 p-6 rounded-xl text-xs text-slate-500 shadow-xs">
                Select a repository to view file tree.
              </div>
            )}
          </div>

          {/* Code Viewer Panel */}
          <div className="md:col-span-2 lg:col-span-3 min-h-[500px]">
            {loadingContent ? (
              <div className="bg-white border border-slate-200 p-12 rounded-xl text-center text-xs text-slate-500 space-y-3 shadow-xs">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                <p>Loading source code file...</p>
              </div>
            ) : fileContentData ? (
              <CodeViewer
                filePath={fileContentData.file_path}
                fileType={fileContentData.file_type}
                content={fileContentData.content}
                sizeBytes={fileContentData.size_bytes}
              />
            ) : (
              <div className="bg-white border border-slate-200 p-12 rounded-xl text-center space-y-3 flex flex-col items-center justify-center min-h-[450px] shadow-xs">
                <FileCode className="w-10 h-10 text-slate-400" />
                <h4 className="font-bold text-slate-900 text-sm">Select a file from the tree explorer</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Click any text file (`.py`, `.ts`, `.js`, `.json`, etc.) in the tree on the left to inspect its raw code.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedProjectId && (
        <ImportRepoModal
          projectId={selectedProjectId}
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onRepoImported={handleRepoImported}
        />
      )}
    </div>
  );
};

export default RepositoryView;
