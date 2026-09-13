import React, { useState } from 'react';
import type { ASTSymbol } from '../types/parser';
import { Layers, Search, Sparkles, Code2, Loader2, ArrowUpRight } from 'lucide-react';

interface SymbolExplorerProps {
  symbols: ASTSymbol[];
  loading: boolean;
  onParseTrigger: () => void;
  onSymbolSelect: (filePath: string, startLine: number) => void;
}

const SymbolExplorer: React.FC<SymbolExplorerProps> = ({
  symbols,
  loading,
  onParseTrigger,
  onSymbolSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredSymbols = symbols.filter((s) => {
    const pathStr = s.file_path || '';
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pathStr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || s.symbol_type.toUpperCase() === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-6 shadow-xs">
      {/* Header & Parse Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>AST Code Symbol Explorer</span>
          </h3>
          <p className="text-xs text-slate-500">
            Tree-sitter AST nodes extracted across repository files ({symbols.length} total symbols)
          </p>
        </div>

        <button
          onClick={onParseTrigger}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Parsing Tree-sitter...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Re-Parse AST Symbols</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbol name or file path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-sans"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs font-mono">
          {['ALL', 'CLASS', 'FUNCTION', 'METHOD', 'IMPORT'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Symbol List Grid */}
      {symbols.length === 0 ? (
        <div className="p-8 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-3">
          <Code2 className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-600">No AST symbols parsed yet for this repository.</p>
          <button
            onClick={onParseTrigger}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
          >
            Trigger AST Parser Now
          </button>
        </div>
      ) : filteredSymbols.length === 0 ? (
        <div className="p-8 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
          No symbols match search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSymbols.map((symbol, idx) => (
            <div
              key={idx}
              onClick={() => onSymbolSelect(symbol.file_path || '', symbol.start_line)}
              className="p-3.5 rounded-lg bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 transition-all cursor-pointer space-y-2 group text-xs font-mono shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-blue-600 truncate">
                  {symbol.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-semibold">
                  {symbol.symbol_type}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[200px]">{symbol.file_path || 'unknown'}</span>
                <span className="text-slate-400 flex items-center gap-0.5">
                  L{symbol.start_line} <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SymbolExplorer;
