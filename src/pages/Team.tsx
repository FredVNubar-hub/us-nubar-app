function Team() {
  const players = [
    "Yass",
    "Fred G",
    "Seb",
    "Jo",
  ];

  return (
    <div>
      <h1>👥 Équipe</h1>

      {players.map((player) => (
        <div
          key={player}
          style={{
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <strong>{player}</strong>

          <div>Voir le profil &gt;</div>
        </div>
      ))}
    </div>
  );
}

export default Team;
