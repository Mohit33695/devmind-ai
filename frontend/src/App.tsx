import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Repository from './pages/Repository';
import Chat from './pages/Chat';
import Architecture from './pages/Architecture';
import Security from './pages/Security';
import Testing from './pages/Testing';

import { Routes, Route, useLocation } from 'react-router-dom';

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      <Header name="Mohit" />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/repository" element={<Repository />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/security" element={<Security />} />
            <Route path="/testing" element={<Testing />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return <AppLayout />;
}

export default App;