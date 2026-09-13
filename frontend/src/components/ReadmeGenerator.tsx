import React, { useState } from 'react';
import { generateReadmeDocumentation } from '../services/docs';
import { FileText, Sparkles, Copy, Check, Loader2 } from 'lucide-react';

interface ReadmeGeneratorProps {
  repositoryId: string;
  repositoryName: string;
}

const ReadmeGenerator: React.FC<ReadmeGeneratorProps> = ({ repositoryId, repositoryName }) => {
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!repositoryId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await generateReadmeDocumentation(repositoryId);
      setReadmeContent(res.readme_markdown);
    } catch (err: any) {
      setError(err?.message || 'Failed to synthesize README documentation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!readmeContent) return;
    navigator.clipboard.writeText(readmeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-6 shadow-xs">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Automated README Generator</span>
          </h3>
          <p className="text-xs text-slate-500">
            Synthesize markdown project documentation directly from codebase AST nodes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {readmeContent && (
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !repositoryId}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Documentation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate README.md</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Output Content */}
      {readmeContent ? (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto space-y-4 max-h-[600px] overflow-y-auto shadow-md">
          <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-200">
            {readmeContent}
          </pre>
        </div>
      ) : (
        <div className="p-12 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-900 text-sm">Generate AI Markdown Documentation</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the "Generate README.md" button above to inspect parsed AST functions, dependencies, and synthesize documentation for <span className="text-slate-800 font-semibold">{repositoryName}</span>.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReadmeGenerator;
