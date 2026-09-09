import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  return (
    <div>
      <Header name="Mohit" />

      <div className="content">
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  )
}

export default App