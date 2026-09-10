import RepositoryCard from '../components/RepositoryCard'
import CodeHealthCard from '../components/CodeHealthCard'
import SecurityCard from '../components/SecurityCard'
import DocumentationCard from '../components/DocumentationCard'

function Dashboard() {
  return (
    <main>
      <h2>Dashboard</h2>

      <p>Welcome to your software engineering workspace.</p>

      <div className="dashboard-cards">
        <RepositoryCard />
        <CodeHealthCard />
        <SecurityCard />
        <DocumentationCard />
      </div>
    </main>
  )
}

export default Dashboard