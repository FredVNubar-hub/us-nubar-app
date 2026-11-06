import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Home() {
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    const loadMatch = async () => {
      const { data, error } = await supabase
        .from("matchs")
        .select("*")
        .eq("statut", "a_venir")
        .limit(1)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setMatch(data);
    };

    loadMatch();
  }, []);

  return (
    <div>
      <h1>🏠 Accueil</h1>

      <h2>Prochain match</h2>

      {match ? (
        <div
          style={{
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <strong>US NUBAR - {match.adversaire}</strong>

          <div>📍 {match.lieu}</div>

          <div>📅 {match.date_match}</div>
        </div>
      ) : (
        <p>Aucun match programmé</p>
      )}
    </div>
  );
}

export default Home;
