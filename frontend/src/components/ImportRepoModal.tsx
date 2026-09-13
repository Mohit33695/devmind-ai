import React, { useState } from 'react';
import { uploadZipRepository, cloneGitHubRepository } from '../services/repositories';
import type { Repository } from '../types/repository';
import { X, Upload, GitBranch, FolderArchive, Sparkles, Loader2 } from 'lucide-react';

interface ImportRepoModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onRepoImported: (repo: Repository) => void;
}

const ImportRepoModal: React.FC<ImportRepoModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onRepoImported,
}) => {
  const [activeTab, setActiveTab] = useState<'zip' | 'github'>('zip');
  const [repoName, setRepoName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let repo: Repository;
      if (activeTab === 'zip') {
        if (!selectedFile) {
          throw new Error('Please select a .ZIP file to upload.');
        }
        repo = await uploadZipRepository(projectId, selectedFile, repoName.trim() || undefined);
      } else {
        if (!githubUrl.trim()) {
          throw new Error('Please provide a valid public GitHub repository URL.');
        }
        repo = await cloneGitHubRepository(projectId, githubUrl.trim(), repoName.trim() || undefined);
      }

      onRepoImported(repo);
      setRepoName('');
      setSelectedFile(null);
      setGithubUrl('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to import repository.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-xl border border-slate-200 p-6 space-y-6 shadow-xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Import Source Repository</h3>
              <p className="text-xs text-slate-500">Upload `.ZIP` archive or clone public GitHub repo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('zip')}
            className={`flex-1 py-2 rounded-md transition-colors cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'zip' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Upload ZIP Archive</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2 rounded-md transition-colors cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'github' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Clone GitHub Repo</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Repository Alias Name <span className="text-slate-400 font-normal text-[11px]">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. devmind-backend-core"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            />
          </div>

          {activeTab === 'zip' ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Select `.ZIP` File <span className="text-blue-600">*</span>
              </label>
              <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 text-center space-y-2 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FolderArchive className="w-8 h-8 text-blue-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  {selectedFile ? selectedFile.name : 'Click or drag & drop `.ZIP` archive here'}
                </p>
                <p className="text-[11px] text-slate-500">Maximum file size: 50MB</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                GitHub Repository URL <span className="text-blue-600">*</span>
              </label>
              <input
                type="url"
                placeholder="https://github.com/facebook/react"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting & Parsing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Import Repository</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportRepoModal;
