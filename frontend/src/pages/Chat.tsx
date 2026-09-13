import React, { useEffect, useState, useRef } from 'react';
import { fetchProjects } from '../services/projects';
import { fetchProjectRepositories } from '../services/repositories';
import { indexRepository, sendChatMessage, fetchChatHistory } from '../services/chat';

import type { Project } from '../types/project';
import type { Repository } from '../types/repository';
import type { ChatMessage } from '../types/chat';

import {
  MessageSquareCode,
  Sparkles,
  Database,
  Send,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  AlertCircle,
} from 'lucide-react';

const ChatView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [sendingQuery, setSendingQuery] = useState<boolean>(false);
  const [indexingVector, setIndexingVector] = useState<boolean>(false);
  const [indexedCount, setIndexedCount] = useState<number | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load Projects on Mount
  useEffect(() => {
    fetchProjects().then((data) => {
      setProjects(data.projects);
      if (data.projects.length > 0) {
        setSelectedProjectId(data.projects[0].id);
      }
    });
  }, []);

  // Load Repositories & Chat History when selected Project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    setError(null);
    setLoadingHistory(true);
    setMessages([]);
    setIndexedCount(null);

    fetchProjectRepositories(selectedProjectId)
      .then((repos) => {
        setRepositories(repos);
        if (repos.length > 0) {
          setSelectedRepoId(repos[0].id);
        }
      })
      .catch(() => {});

    fetchChatHistory(selectedProjectId)
      .then((hist) => {
        setSessionId(hist.session_id || undefined);
        setMessages(hist.messages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingHistory(false));
  }, [selectedProjectId]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendingQuery]);

  const handleIndexRepository = async () => {
    if (!selectedRepoId) return;
    setIndexingVector(true);
    setError(null);

    try {
      const res = await indexRepository(selectedRepoId);
      setIndexedCount(res.chunks_indexed);
    } catch (err: any) {
      setError(err?.message || 'Failed to index repository into vector store.');
    } finally {
      setIndexingVector(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || inputMessage).trim();
    if (!query || !selectedProjectId || sendingQuery) return;

    setInputMessage('');
    setError(null);

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: sessionId || '',
      sender: 'user',
      message: query,
      sources: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSendingQuery(true);

    try {
      const aiResponse = await sendChatMessage(selectedProjectId, query, sessionId);
      setSessionId(aiResponse.session_id);
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: any) {
      setError(err?.message || 'Failed to get answer from AI RAG engine.');
    } finally {
      setSendingQuery(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-95px)] space-y-4 pb-4 animate-fadeIn">
      {/* Top Bar Controls */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <MessageSquareCode className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">AI Repository RAG Chat</h2>
          </div>

          <div>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
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
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
            >
              {repositories.length === 0 ? (
                <option value="">No Repositories</option>
              ) : (
                repositories.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Vector DB Index Action */}
        <div className="flex items-center space-x-3">
          {indexedCount !== null && (
            <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{indexedCount} Chunks Vectorized</span>
            </span>
          )}

          <button
            onClick={handleIndexRepository}
            disabled={indexingVector || !selectedRepoId}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center space-x-2"
          >
            {indexingVector ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Vectorizing Qdrant...</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5" />
                <span>Index Vector DB</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2 font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="bg-white border border-slate-200 flex-1 rounded-xl p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-xs">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.length === 0 && !loadingHistory ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Bot className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-lg font-bold text-slate-900">Understand your codebase with AI</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ask questions about your repository and explore how your software works.
                </p>
              </div>

              {/* Prompt Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-w-xl w-full pt-2">
                <button
                  onClick={() => handleSendMessage(undefined, 'How does the repository handle file uploads and security?')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 text-slate-700 text-left transition-all hover:border-blue-200 cursor-pointer shadow-xs"
                >
                  <span className="font-bold text-blue-600 block mb-1">🔐 Auth & Security</span>
                  "How does the repo handle file uploads and security?"
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, 'What AST parser functions and classes are defined in the codebase?')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 text-slate-700 text-left transition-all hover:border-purple-200 cursor-pointer shadow-xs"
                >
                  <span className="font-bold text-purple-600 block mb-1">🌳 AST Symbols</span>
                  "What parser functions and classes are defined?"
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-3xl p-4 sm:p-5 rounded-2xl text-xs leading-relaxed space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-blue-50 text-slate-900 border border-blue-200 rounded-tr-none shadow-xs'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-200/60 pb-1.5 mb-2 font-mono">
                    <span className="font-bold uppercase tracking-wider flex items-center space-x-1.5 text-slate-600">
                      {msg.sender === 'user' ? (
                        <>
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>You</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>DevMind AI Assistant</span>
                        </>
                      )}
                    </span>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800">
                    {msg.message}
                  </div>

                  {/* Sources Citation Cards */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 space-y-2 font-mono">
                      <p className="text-[11px] uppercase font-bold text-blue-600 flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5 text-blue-600" />
                        <span>Verified Codebase Citations ({msg.sources.length}):</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.sources.map((src, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 text-[11px] space-y-1 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-blue-400 font-bold truncate">
                                {src.file_path}:L{src.start_line}-L{src.end_line}
                              </span>
                              <button
                                onClick={() => copyToClipboard(src.snippet, `${msg.id}-${idx}`)}
                                className="text-slate-400 hover:text-white transition-colors"
                              >
                                {copiedId === `${msg.id}-${idx}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <p className="text-slate-400 line-clamp-2 text-[10px] italic font-sans">
                              "{src.snippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {sendingQuery && (
            <div className="flex items-center space-x-2 text-xs text-blue-600 font-mono animate-pulse p-2 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Retrieving vector embeddings & synthesizing answer...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask a question about your codebase architecture, functions, or logic..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={sendingQuery || !selectedProjectId}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50 transition-all font-sans"
          />

          <button
            type="submit"
            disabled={sendingQuery || !inputMessage.trim()}
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
