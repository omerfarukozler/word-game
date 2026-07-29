export function HomePage() {
  return (
    <main className="page-shell page-shell--narrow" aria-labelledby="home-title">
      <p className="eyebrow">Word Battle</p>
      <h1 id="home-title">Frontend altyapısı hazır</h1>
      <p className="lede">
        Oda oluşturma ve odaya katılma ekranları Faz 9.3 kapsamında eklenecek.
      </p>
      <section className="status-panel" aria-label="Faz 9.2 kapsamı">
        <h2>Faz 9.2</h2>
        <p>
          Router, API client, SignalR client, session persistence, test altyapısı ve
          global tasarım tokenları kuruldu.
        </p>
      </section>
    </main>
  )
}
