import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  GitBranch,
  ShieldCheck,
  FileCode,
  Sparkles,
  ArrowRight,
  Bot,
  Activity,
  FileText,
  CheckCircle2,
  Search,
  Play,
  RefreshCw,
  Database,
  Server,
  Layout,
  ChevronRight,
  FolderTree,
} from 'lucide-react';

const LandingPage: React.FC = () => {
  // Centerpiece Hero Tab state
  const [heroTab, setHeroTab] = useState<'editor' | 'ast' | 'architecture'>('editor');

  // Product Showcase active view
  const [productTab, setProductTab] = useState<'chat' | 'explorer' | 'architecture' | 'analysis'>('chat');

  // AI Interactive Demo State
  const [demoState, setDemoState] = useState<'idle' | 'typing' | 'done'>('done');
  const [typedText, setTypedText] = useState<string>('');

  const fullAnswer = `Authentication in DevMind AI uses FastAPI OAuth2 with JWT bearer tokens.

1. Login route validates user credentials via bcrypt hash.
2. Token generator issues signed JWT with 24-hour expiration.
3. Protected endpoints verify authorization header using dependency injection.`;

  useEffect(() => {
    if (demoState === 'typing') {
      let index = 0;
      setTypedText('');
      const interval = setInterval(() => {
        if (index < fullAnswer.length) {
          setTypedText(fullAnswer.slice(0, index + 1));
          index++;
        } else {
          setDemoState('done');
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    } else if (demoState === 'done') {
      setTypedText(fullAnswer);
    }
  }, [demoState]);

  const restartDemo = () => {
    setDemoState('typing');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Top Banner Accent */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-[11px] font-semibold py-1.5 px-4 text-center tracking-wide flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
        <span>DevMind AI 1.0 is live — AST Parsing, Vector RAG & Codebase Architecture Visualizer</span>
        <Link to="/dashboard" className="underline font-bold hover:text-blue-100 ml-1">
          Explore Free &rarr;
        </Link>
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                DevMind <span className="text-blue-600">AI</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 block -mt-1 uppercase tracking-wider">
                Intelligent Code Workspace
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
            <a href="#product-showcase" className="hover:text-blue-600 transition-colors">
              Product Overview
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#ai-demo" className="hover:text-blue-600 transition-colors">
              Interactive Demo
            </a>
            <a href="#architecture" className="hover:text-blue-600 transition-colors">
              Architecture
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Start Building</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 max-w-6xl mx-auto text-center">
        {/* Decorative subtle background gradient blob */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-100 via-indigo-50 to-purple-100 blur-3xl opacity-60 pointer-events-none -z-10 rounded-full" />

        {/* Hero Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-blue-700 shadow-xs mb-6">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
          <span>Next-Gen AST Code Intelligence</span>
          <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-4xl mx-auto">
          Understand Every Codebase.{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Build With Intelligence.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Explore repositories, understand software architecture, and ask AI questions about your code — all in one intelligent workspace.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>Start Building</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#product-showcase"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 text-slate-500 fill-slate-500" />
            <span>Explore Features</span>
          </a>
        </div>

        {/* Hero Interactive Preview Component */}
        <div className="mt-14 relative bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-2 sm:p-4 text-left overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/90 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono text-slate-600 font-medium ml-2 flex items-center space-x-1">
                <FolderTree className="w-3.5 h-3.5 text-blue-600 inline mr-1" />
                devmind-ai / backend / app / services / architecture.py
              </span>
            </div>

            {/* Tab Selectors */}
            <div className="flex bg-slate-200/80 p-1 rounded-lg text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setHeroTab('editor')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  heroTab === 'editor'
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Code & AST Preview
              </button>
              <button
                onClick={() => setHeroTab('ast')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  heroTab === 'ast'
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AST Node Graph
              </button>
              <button
                onClick={() => setHeroTab('architecture')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  heroTab === 'architecture'
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vector RAG Telemetry
              </button>
            </div>
          </div>

          {/* Hero Main Terminal Screen */}
          <div className="bg-slate-900 rounded-b-xl p-5 font-mono text-xs text-slate-100 min-h-[340px] overflow-x-auto shadow-inner">
            {heroTab === 'editor' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                    <span>Python AST Extractor</span>
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>AST Indexed</span>
                    </span>
                  </div>
                  <pre className="text-slate-200 leading-relaxed overflow-x-auto text-[11.5px]">
                    <code>
                      <span className="text-purple-400">class</span> <span className="text-yellow-300">ArchitectureGraphService</span>:
                      {'\n'}    <span className="text-purple-400">def</span> <span className="text-blue-400">__init__</span>(self, repository_path: str):
                      {'\n'}        self.parser = TreeSitterParser(lang=<span className="text-emerald-400">"python"</span>)
                      {'\n'}        self.graph = ModuleDependencyDAG()
                      {'\n'}
                      {'\n'}    <span className="text-purple-400">async def</span> <span className="text-blue-400">generate_dependency_tree</span>(self) -&gt; Dict:
                      {'\n'}        nodes = await self.parser.extract_ast_symbols()
                      {'\n'}        embeddings = await qdrant_client.index_symbols(nodes)
                      {'\n'}        <span className="text-purple-400">return</span> {'{'}<span className="text-cyan-400">"modules"</span>: len(nodes), <span className="text-cyan-400">"health"</span>: 0.98{'}'}
                    </code>
                  </pre>
                </div>

                {/* Right Side Stats Panel */}
                <div className="space-y-3 font-sans">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <span className="text-[11px] font-bold text-blue-400 block uppercase tracking-wider font-mono">
                      ⚡ Repository Analysis
                    </span>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Total Code Files:</span>
                      <span className="font-bold text-white font-mono">148 files</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">AST Symbols Extracted:</span>
                      <span className="font-bold text-cyan-400 font-mono">4,120 nodes</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Vector Embeddings:</span>
                      <span className="font-bold text-purple-400 font-mono">1,890 vectors</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-400 block uppercase tracking-wider font-mono">
                      🛡️ Codebase Health Score
                    </span>
                    <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[96%]" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-300 font-mono">
                      <span>Security Grade: A+</span>
                      <span className="text-emerald-400 font-bold">96/100</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {heroTab === 'ast' && (
              <div className="space-y-4 font-sans text-xs">
                <div className="text-slate-300 font-mono text-[11px]">
                  Tree-Sitter Abstract Syntax Tree (AST) Hierarchy:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <div className="text-blue-400 font-mono font-bold">ClassDef: ArchitectureGraphService</div>
                    <p className="text-slate-400 text-[11px]">Line 12 - Line 84 | Complexity: 4</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <div className="text-purple-400 font-mono font-bold">AsyncFunctionDef: generate_dependency_tree</div>
                    <p className="text-slate-400 text-[11px]">Line 24 - Line 45 | Calls: qdrant_client</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <div className="text-cyan-400 font-mono font-bold">Import: app.core.vector_db</div>
                    <p className="text-slate-400 text-[11px]">Resolved symbols: 8 exported methods</p>
                  </div>
                </div>
              </div>
            )}

            {heroTab === 'architecture' && (
              <div className="space-y-4 font-sans text-xs">
                <div className="p-3.5 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-200 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>Qdrant Vector DB Indexer status: Active (1,890 code chunk embeddings indexed in 1.2s)</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] space-y-1.5">
                  <div className="text-purple-400 font-bold">[RAG Pipeline Log]</div>
                  <div>- Query: "Explain architecture service initialization"</div>
                  <div>- Vector Cosine Similarity: 0.9412</div>
                  <div>- Context Window: backend/app/services/architecture.py (lines 10-35)</div>
                  <div className="text-emerald-400">- High precision answer synthesized</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. PRODUCT PREVIEW SECTION */}
      <section id="product-showcase" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Intelligent Workspace
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            A Complete Visual Platform For Your Software
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Experience an interactive code platform with codebase explorer, AI chat assistant, repository analysis, and architecture visualizations.
          </p>
        </div>

        {/* Product Showcase Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'chat', label: 'AI Chat Assistant', icon: Bot },
            { id: 'explorer', label: 'Codebase Explorer', icon: FolderTree },
            { id: 'architecture', label: 'Architecture Graph', icon: GitBranch },
            { id: 'analysis', label: 'Repository Analysis', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = productTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setProductTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Product Showcase Visual Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-4 sm:p-6 transition-all">
          {productTab === 'chat' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-sm text-slate-900">DevMind Codebase Assistant</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full ml-auto">
                    Qdrant RAG Connected
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-50/80 text-blue-900 p-3.5 rounded-xl border border-blue-100 text-xs self-end">
                    <span className="font-bold text-blue-700 block mb-1">Developer Question:</span>
                    "What endpoints are defined in the architecture API module and how do they parse parameters?"
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs text-slate-700 leading-relaxed">
                    <div className="flex items-center space-x-2 font-bold text-slate-900">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>DevMind AI Response:</span>
                    </div>
                    <p>
                      The architecture API module at <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono text-[11px]">app/api/v1/architecture.py</code> exposes 3 main GET endpoints:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-slate-800">
                      <li>GET /api/v1/architecture/graph — Fetches full module DAG topology</li>
                      <li>GET /api/v1/architecture/metrics — Returns cyclomatic complexity metrics</li>
                      <li>GET /api/v1/architecture/node-info — Extracts AST info for a target module</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    <span>Vector Citation Context</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-700">
                      <span className="text-blue-600 font-bold block">backend/app/api/v1/architecture.py</span>
                      Lines 14-42 | Cosine Similarity: 0.98
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-700">
                      <span className="text-purple-600 font-bold block">backend/app/services/architecture.py</span>
                      Lines 50-88 | Cosine Similarity: 0.93
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {productTab === 'explorer' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-mono text-xs">
                <div className="font-bold text-slate-900 mb-2 flex items-center space-x-2">
                  <FolderTree className="w-4 h-4 text-blue-600" />
                  <span>Repository File Tree</span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <div className="text-blue-600 font-bold">📁 backend/app/</div>
                  <div className="pl-4 text-slate-600">📁 api/v1/</div>
                  <div className="pl-8 text-emerald-700">📄 architecture.py</div>
                  <div className="pl-8 text-emerald-700">📄 chat.py</div>
                  <div className="pl-8 text-emerald-700">📄 docs.py</div>
                  <div className="pl-4 text-slate-600">📁 services/</div>
                  <div className="pl-8 text-purple-700">📄 ast_parser.py</div>
                  <div className="pl-8 text-purple-700">📄 qdrant_service.py</div>
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-900 text-slate-100 p-5 rounded-xl font-mono text-xs space-y-3">
                <div className="text-slate-400 text-[11px] pb-2 border-b border-slate-800 flex justify-between">
                  <span>Symbol Details — ast_parser.py</span>
                  <span className="text-cyan-400 font-bold">Tree-sitter Python 3.11</span>
                </div>
                <pre className="text-slate-200 text-[11.5px] leading-relaxed overflow-x-auto">
                  <code>
                    <span className="text-purple-400">def</span> <span className="text-blue-400">parse_file_ast</span>(file_path: str):
                    {'\n'}    with open(file_path, <span className="text-emerald-400">'r'</span>) as f:
                    {'\n'}        tree = parser.parse(bytes(f.read(), <span className="text-emerald-400">'utf-8'</span>))
                    {'\n'}    <span className="text-purple-400">return</span> extract_functions(tree.root_node)
                  </code>
                </pre>
              </div>
            </div>
          )}

          {productTab === 'architecture' && (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-6">
              <h4 className="font-bold text-slate-900 text-base">Module Dependency Architecture Map</h4>
              <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono">
                <div className="bg-white border border-blue-200 text-blue-700 px-4 py-3 rounded-xl shadow-xs font-bold">
                  Frontend (React/Vite)
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
                <div className="bg-white border border-indigo-200 text-indigo-700 px-4 py-3 rounded-xl shadow-xs font-bold">
                  API Router (FastAPI)
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
                <div className="bg-white border border-purple-200 text-purple-700 px-4 py-3 rounded-xl shadow-xs font-bold">
                  AST & Vector Service
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
                <div className="bg-white border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl shadow-xs font-bold">
                  Qdrant Vector DB
                </div>
              </div>
            </div>
          )}

          {productTab === 'analysis' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-center">
                <div className="text-3xl font-extrabold text-blue-600 font-mono">100%</div>
                <div className="text-xs font-semibold text-slate-700">AST Parsing Accuracy</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-center">
                <div className="text-3xl font-extrabold text-purple-600 font-mono">0.45s</div>
                <div className="text-xs font-semibold text-slate-700">Vector Search Latency</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-center">
                <div className="text-3xl font-extrabold text-emerald-600 font-mono">A+</div>
                <div className="text-xs font-semibold text-slate-700">Security Health Grade</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. FEATURES SECTION (6 Unique Card Designs) */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Engineered Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Six Intelligent Engines for Your Codebase
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Everything software teams need to explore, search, document, and audit complex repositories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: AI Codebase Chat */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Codebase Chat</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask architectural questions and get line-exact responses backed by vector embeddings and AST symbols.
              </p>
            </div>
            {/* Visual Callout */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono text-[11px] text-slate-700 space-y-1">
              <div className="text-blue-600 font-bold">💬 "How does state management work?"</div>
              <div className="text-slate-500 text-[10px]">Indexed 42 files across /frontend/src</div>
            </div>
          </div>

          {/* Feature 2: Repository Intelligence */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <FolderTree className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Repository Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant full-stack overview with file tree breakdown, language distributions, and symbol density.
              </p>
            </div>
            {/* Visual Widget */}
            <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between font-medium text-indigo-900 text-[11px]">
                <span>TypeScript / Python</span>
                <span>88% Coverage</span>
              </div>
              <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[88%]" />
              </div>
            </div>
          </div>

          {/* Feature 3: AST-Based Code Analysis */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <FileCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AST-Based Code Analysis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tree-Sitter syntax tree parsing extracts exact class structures, function signatures, and method parameters.
              </p>
            </div>
            {/* Visual Code Box */}
            <div className="bg-slate-900 text-purple-300 p-3 rounded-xl font-mono text-[10.5px]">
              <code>node: FunctionDeclaration (line 42)</code>
            </div>
          </div>

          {/* Feature 4: Architecture Visualization */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Architecture Visualization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive DAG diagrams map import relationships and module coupling across the entire codebase.
              </p>
            </div>
            {/* Visual Flow */}
            <div className="flex items-center justify-around bg-cyan-50/70 border border-cyan-100 p-2.5 rounded-xl text-[11px] font-mono font-bold text-cyan-900">
              <span>Router</span>
              <span>&rarr;</span>
              <span>Service</span>
              <span>&rarr;</span>
              <span>DB</span>
            </div>
          </div>

          {/* Feature 5: Automated Documentation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Automated Documentation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate clean markdown documentation and setup guides automatically from indexed AST nodes.
              </p>
            </div>
            {/* Visual Badge */}
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center space-x-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>README.md auto-generated</span>
            </div>
          </div>

          {/* Feature 6: Security & Code Health */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Security & Code Health</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated static analysis checks for hardcoded credentials, vulnerable imports, and complexity hotspots.
              </p>
            </div>
            {/* Visual Status */}
            <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold text-rose-800">
              <span>0 Critical Secrets Exposed</span>
              <span className="bg-rose-200 text-rose-900 text-[10px] px-2 py-0.5 rounded-full font-bold">Passed</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Simple 3-Step Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How DevMind AI Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Get instant codebase clarity in less than two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/30">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900">Import Your Repository</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Connect your Git repository or enter a local codebase path. DevMind AI scans files without modifying code.
            </p>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-700">
              git clone devmind-ai/project.git
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-indigo-500/30">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900">Understand Your Code with AI</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tree-Sitter parses AST symbols while Qdrant indexes chunk embeddings for high-precision semantic search.
            </p>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-700">
              Parsing AST nodes &amp; indexing...
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 relative">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-purple-500/30">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900">Build &amp; Maintain Software</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Query code structure, inspect module graphs, generate READMEs, and ship features faster with AI.
            </p>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-700">
              DevMind Intelligence active 🚀
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE AI DEMO SECTION */}
      <section id="ai-demo" className="py-20 px-6 max-w-5xl mx-auto border-t border-slate-200">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Live Frontend Simulation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Interactive AI Chat Demonstration
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            See how DevMind AI answers developer questions with exact codebase context.
          </p>
        </div>

        {/* Interactive Chat Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-5 sm:p-6 space-y-5">
          {/* Developer Question */}
          <div className="flex items-start space-x-3 bg-blue-50 border border-blue-200/80 p-4 rounded-xl text-xs sm:text-sm text-blue-900">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              DEV
            </div>
            <div className="space-y-1">
              <div className="font-bold text-blue-700 text-xs uppercase tracking-wider">Developer Query:</div>
              <div className="font-semibold text-slate-900 text-sm">
                "How does authentication work in this project?"
              </div>
            </div>
          </div>

          {/* AI Response Box */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-xl space-y-4 font-sans text-xs sm:text-sm border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-slate-200 text-xs font-mono">DevMind AI Stream Engine</span>
              </div>

              <button
                onClick={restartDemo}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replay Animation</span>
              </button>
            </div>

            {/* Typed Text */}
            <div className="space-y-3 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap">
              {typedText}
              {demoState === 'typing' && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />}
            </div>

            {/* Synthesized Code Reference Citation */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
              <div className="text-blue-400 font-bold text-[11px]">
                Cited file: backend/app/api/v1/auth.py (Line 34)
              </div>
              <pre className="text-slate-300 text-[11px]">
                <code>
                  <span className="text-purple-400">@router.post</span>(<span className="text-emerald-400">"/login"</span>)
                  {'\n'}<span className="text-purple-400">async def</span> <span className="text-blue-400">login</span>(form_data: OAuth2PasswordRequestForm):
                  {'\n'}    user = authenticate_user(form_data.username, form_data.password)
                  {'\n'}    token = create_access_token(data=&#123;<span className="text-cyan-400">"sub"</span>: user.id&#125;)
                  {'\n'}    <span className="text-purple-400">return</span> &#123;<span className="text-cyan-400">"access_token"</span>: token, <span className="text-cyan-400">"token_type"</span>: <span className="text-emerald-400">"bearer"</span>&#125;
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ARCHITECTURE SHOWCASE SECTION */}
      <section id="architecture" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-200">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            System Topology
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Software Architecture &amp; Module Flow
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            DevMind AI automatically extracts system flow graphs from raw codebase source trees.
          </p>
        </div>

        {/* Interactive Architecture Flow Visual */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {/* Node 1: Frontend */}
            <div className="bg-slate-50 border border-blue-200 p-5 rounded-xl space-y-2 text-center hover:border-blue-500 transition-colors shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
                <Layout className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Frontend Layer</h4>
              <p className="text-[11px] text-slate-500 font-mono">React + Vite + Tailwind</p>
            </div>

            {/* Node 2: API */}
            <div className="bg-slate-50 border border-indigo-200 p-5 rounded-xl space-y-2 text-center hover:border-indigo-500 transition-colors shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">API Layer</h4>
              <p className="text-[11px] text-slate-500 font-mono">FastAPI REST Endpoints</p>
            </div>

            {/* Node 3: Services */}
            <div className="bg-slate-50 border border-purple-200 p-5 rounded-xl space-y-2 text-center hover:border-purple-500 transition-colors shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 mx-auto flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Services Engine</h4>
              <p className="text-[11px] text-slate-500 font-mono">Tree-Sitter AST &amp; RAG</p>
            </div>

            {/* Node 4: Database */}
            <div className="bg-slate-50 border border-emerald-200 p-5 rounded-xl space-y-2 text-center hover:border-emerald-500 transition-colors shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Database &amp; Vectors</h4>
              <p className="text-[11px] text-slate-500 font-mono">Qdrant Vector DB + SQLite</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-center font-mono">
            ⚡ Automated DAG generation maps 100% of function definitions, API calls, and DB dependencies.
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-10 sm:p-14 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle overlay effect */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Your codebase. Your intelligence.
          </h2>

          <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto font-normal">
            Start exploring your software with DevMind AI. Transform any repository into an interactive, AI-powered developer workspace today.
          </p>

          <div className="pt-4 flex justify-center">
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-blue-700 font-bold text-sm shadow-xl transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-blue-700" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">DevMind AI</span>
          </div>

          <div className="flex flex-wrap justify-center space-x-8 font-semibold text-slate-600">
            <a href="#product-showcase" className="hover:text-blue-600 transition-colors">
              Product
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#architecture" className="hover:text-blue-600 transition-colors">
              Architecture
            </a>
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
          </div>

          <p>© 2026 DevMind AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

