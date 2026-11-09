import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Team() {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const loadPlayers = async () => {
      const { data, error } = await supabase
        .from("joueurs")
        .select("*")
        .order("nom");

      if (error) {
        console.error(error);
        return;
      }

      setPlayers(data || []);
    };

    loadPlayers();
  }, []);

  return (
    <div>
      

      {players.map((player) => (
        <div
  key={player.id}
  style={{
    backgroundColor: "#FFFFFF",
    padding: "20px",
    marginBottom: "15px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(11,79,125,0.12)",
    border: "1px solid #E5E7EB",
  }}
>
          <Link
  to={`/player/${player.id}`}
  style={{
    textDecoration: "none",
    color: "#1009E6",
    fontSize: "22px",
    fontWeight: "bold",
  }}
>
  {player.nom}
</Link>

<div>⚽ Poste : {player.poste}</div>

<div>🔢 Numéro : {player.numero}</div>

<div>🏆 Buts : {player.buts}</div>

<div>🎯 Passes : {player.passes}</div>
        </div>
      ))}
    </div>
  );
}

export default Team;