import RepositoryCard from './RepositoryCard'
import CodeHealthCard from './CodeHealthCard'

function Dashboard() {
  return (
    <main>
      <h2>Dashboard</h2>

      <p>Welcome to your software engineering workspace.</p>

      <div className="dashboard-cards">
        <RepositoryCard />
        <CodeHealthCard />
      </div>
    </main>
  )
}

export default Dashboard