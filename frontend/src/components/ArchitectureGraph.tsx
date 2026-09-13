import React, { useState } from 'react';
import type { GraphNode, GraphEdge } from '../types/architecture';
import { GitBranch, Layers } from 'lucide-react';

interface ArchitectureGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const ArchitectureGraph: React.FC<ArchitectureGraphProps> = ({ nodes, edges }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const getModuleCategory = (path: string) => {
    if (path.includes('api') || path.includes('routes')) return 'API Endpoint';
    if (path.includes('service') || path.includes('core')) return 'Business Logic';
    if (path.includes('model') || path.includes('db')) return 'Data Persistence';
    return 'Utility Module';
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-6 shadow-xs">
      {/* Top Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-600">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Nodes: <strong className="text-slate-900">{nodes.length}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-600">
            <GitBranch className="w-4 h-4 text-purple-600" />
            <span>Import Edges: <strong className="text-slate-900">{edges.length}</strong></span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> API Layer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Services
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" /> Storage
          </span>
        </div>
      </div>

      {/* Main Node Grid Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const category = getModuleCategory(node.label);

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-blue-50 border-blue-400 text-slate-900 shadow-sm'
                  : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700 hover:border-blue-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-200 text-slate-700">
                  {category}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Size: {node.size || 1}</span>
              </div>

              <h4 className="font-mono font-bold text-xs truncate text-slate-900">{node.label}</h4>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-200">
                <span>Inbound: {edges.filter((e) => e.target === node.id).length}</span>
                <span>Outbound: {edges.filter((e) => e.source === node.id).length}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Details Inspection Drawer */}
      {selectedNode && (
        <div className="p-4 rounded-xl bg-slate-50 border border-blue-200 space-y-3 font-mono text-xs text-slate-700 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-blue-600 text-sm">{selectedNode.label}</span>
            <span className="text-[10px] text-slate-500">Node ID: {selectedNode.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Imported By (Inbound Dependencies):</span>
              {edges.filter((e) => e.target === selectedNode.id).length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">No inbound imports</p>
              ) : (
                edges
                  .filter((e) => e.target === selectedNode.id)
                  .map((e, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-white border border-slate-200 text-[11px] text-blue-600 font-medium">
                      ← {nodes.find((n) => n.id === e.source)?.label || e.source}
                    </div>
                  ))
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Imports (Outbound Dependencies):</span>
              {edges.filter((e) => e.source === selectedNode.id).length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">No outbound imports</p>
              ) : (
                edges
                  .filter((e) => e.source === selectedNode.id)
                  .map((e, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-white border border-slate-200 text-[11px] text-purple-600 font-medium">
                      → {nodes.find((n) => n.id === e.target)?.label || e.target}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureGraph;
