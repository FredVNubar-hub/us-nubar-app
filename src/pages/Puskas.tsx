import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

function Puskas() {
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    const loadWinner = async () => {
      const { data, error } = await supabase
  .from("puskas")
  .select("*")
  .order("annee", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setWinners(data || []);
    };

    loadWinner();
  }, []);

  if (!winners.length) {
  return <p>Chargement...</p>;
}

  return (
    <>
      <Link
        to="/more"
        style={{
          textDecoration: "none",
          color: "#1009E6",
          fontWeight: "bold",
        }}
      >
        ← Retour à Autres
      </Link>
<h1
  style={{
    color: "#1009E6",
    textAlign: "center",
    marginTop: "20px",
  }}
>
  ⚽ Puskas
</h1>

      {winners.map((winner) => (
  <div
    key={winner.id}
    style={{
      backgroundColor: "#FFFFFF",
      padding: "25px",
      borderRadius: "16px",
      boxShadow: "0 8px 24px rgba(16,9,230,0.15)",
      border: "1px solid #E5E7EB",
      marginTop: "15px",
      marginBottom: "20px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        marginBottom: "15px",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontWeight: "bold",
          fontSize: "22px",
        }}
      >
        {winner.annee}
      </span>

      <span
        style={{
          backgroundColor: "#FFD700",
          color: "#333333",
          padding: "6px 12px",
          borderRadius: "20px",
          fontWeight: "bold",
        }}
      >
        👑 {winner.vainqueur}
      </span>

      <span
        style={{
          border: "2px solid #C0C0C0",
          color: "#666666",
          backgroundColor: "#F8F8F8",
          padding: "6px 12px",
          borderRadius: "20px",
        }}
      >
        🥈 {[
          winner.finaliste_1,
          winner.finaliste_2,
          winner.finaliste_3,
        ]
          .filter(Boolean)
          .join(" • ")}
      </span>
    </div>

    <hr />

    <p>
      📝 {winner.description}
    </p>
  </div>
))}
</>
);
}

export default Puskas;