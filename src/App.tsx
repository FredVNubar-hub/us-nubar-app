function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111827",
        color: "white",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ color: "white" }}>⚽ US NUBAR</h1>

      <h2>Prochain match</h2>

      <div
        style={{
          backgroundColor: "#1f2937",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <strong>US NUBAR - La Ciotat</strong>
        <br />
        Vendredi 13 novembre - 20h00
      </div>

      <h2>Dernier résultat</h2>

      <div
        style={{
          backgroundColor: "#1f2937",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        US NUBAR 5 - 2 NHF
      </div>

      <h2>Top 3 Buteurs</h2>

      <ol>
        <li>Yass - 27</li>
        <li>Fred G - 15</li>
        <li>Enzo M - 8</li>
      </ol>

      <h2>Top 3 Passeurs</h2>

      <ol>
        <li>Yass - 10</li>
        <li>Fred G - 10</li>
        <li>Enzo M - 7</li>
      </ol>
    </div>
  );
}

export default App;