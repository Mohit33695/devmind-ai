import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Repository from './pages/Repository'
import Chat from './pages/Chat'
import Architecture from './pages/Architecture'
import Security from './pages/Security'
import Testing from './pages/Testing'
import './App.css'

import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div>
      <Header name="Mohit" />

      <div className="content">
        <Sidebar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repository" element={<Repository />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/security" element={<Security />} />
          <Route path="/testing" element={<Testing />} />
        </Routes>
      </div>
    </div>
  )
}

export default App