import React, { useState } from 'react';
import type { FileTreeNode } from '../types/repository';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  ChevronDown,
  ChevronRight,
  Search,
  Code2,
  Terminal,
} from 'lucide-react';

interface FileTreeProps {
  node: FileTreeNode;
  selectedFilePath: string;
  onFileSelect: (path: string) => void;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <Code2 className="w-3.5 h-3.5 text-blue-600" />;
    case 'py':
      return <Terminal className="w-3.5 h-3.5 text-amber-600" />;
    case 'json':
    case 'md':
      return <FileText className="w-3.5 h-3.5 text-cyan-600" />;
    default:
      return <FileCode className="w-3.5 h-3.5 text-slate-500" />;
  }
};

const FileTreeNodeItem: React.FC<{
  node: FileTreeNode;
  depth: number;
  selectedFilePath: string;
  filterQuery: string;
  onFileSelect: (path: string) => void;
}> = ({ node, depth, selectedFilePath, filterQuery, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState<boolean>(depth < 2);

  const isDirectory = node.type === 'directory';
  const nodePath = node.path || node.name;
  const isSelected = selectedFilePath === nodePath;

  if (
    filterQuery &&
    !node.name.toLowerCase().includes(filterQuery.toLowerCase()) &&
    (!node.children ||
      !node.children.some((c: FileTreeNode) => c.name.toLowerCase().includes(filterQuery.toLowerCase())))
  ) {
    return null;
  }

  return (
    <div className="select-none text-xs font-mono">
      <div
        onClick={() => {
          if (isDirectory) {
            setIsOpen(!isOpen);
          } else {
            onFileSelect(nodePath);
          }
        }}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={`flex items-center space-x-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-50 text-blue-600 font-semibold'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-normal'
        }`}
      >
        {isDirectory ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-blue-500/80 flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 h-3.5 inline-block" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {isDirectory && isOpen && node.children && (
        <div className="space-y-0.5">
          {node.children.map((childNode: FileTreeNode, index: number) => (
            <FileTreeNodeItem
              key={index}
              node={childNode}
              depth={depth + 1}
              selectedFilePath={selectedFilePath}
              filterQuery={filterQuery}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree: React.FC<FileTreeProps> = ({ node, selectedFilePath, onFileSelect }) => {
  const [filterQuery, setFilterQuery] = useState('');

  return (
    <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-3 max-h-[600px] overflow-y-auto shadow-xs">
      <div className="flex items-center justify-between px-2 pt-1 border-b border-slate-100 pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          File Tree
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Filter files..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-sans"
        />
      </div>

      <div className="space-y-0.5 pr-1">
        <FileTreeNodeItem
          node={node}
          depth={0}
          selectedFilePath={selectedFilePath}
          filterQuery={filterQuery}
          onFileSelect={onFileSelect}
        />
      </div>
    </div>
  );
};

export default FileTree;
