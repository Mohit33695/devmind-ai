import React, { useState } from 'react';
import { Copy, Check, FileCode, Layers, HardDrive } from 'lucide-react';

interface CodeViewerProps {
  filePath: string;
  fileType: string;
  content: string;
  sizeBytes: number;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ filePath, fileType, content, sizeBytes }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = content.split('\n');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-md">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-slate-200 truncate">{filePath}</span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
            {fileType || 'plaintext'}
          </span>
          <span className="flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{lines.length} LOC</span>
          </span>
          <span className="flex items-center space-x-1">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>{(sizeBytes / 1024).toFixed(1)} KB</span>
          </span>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Text Content */}
      <div className="p-4 bg-slate-900 overflow-x-auto font-mono text-xs leading-relaxed max-h-[580px] overflow-y-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40">
                <td className="w-10 select-none text-right pr-4 text-slate-600 text-[11px]">
                  {idx + 1}
                </td>
                <td className="text-slate-200 whitespace-pre font-mono">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CodeViewer;
