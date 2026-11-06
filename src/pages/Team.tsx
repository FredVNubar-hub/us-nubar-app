import { useEffect, useState } from "react";
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
      <h1>👥 Équipe</h1>

      {players.map((player) => (
        <div
          key={player.id}
          style={{
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <strong>{player.nom}</strong>

<div>⚽ Poste : {player.poste}</div>

<div>🔢 Numéro : {player.numero}</div>

<div>🎂 Âge : {player.age} ans</div>

<div>🏆 Buts : {player.buts}</div>

<div>🎯 Passes : {player.passes}</div>
        </div>
      ))}
    </div>
  );
}

export default Team;