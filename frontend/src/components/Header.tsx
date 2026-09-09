function Header({ name }: { name: string }) {
  return (
    <header>
      <h1>DevMind AI</h1>
      <p>Welcome, {name}</p>
    </header>
  )
}

export default Header