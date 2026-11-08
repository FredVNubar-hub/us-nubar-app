import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Rankings() {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const loadPlayers = async () => {
      const { data, error } = await supabase
        .from("joueurs")
        .select("*");

      if (error) {
        console.error(error);
        return;
      }

      setPlayers(data || []);
    };

    loadPlayers();
  }, []);

  const topScorers = [...players].sort(
    (a, b) => b.buts - a.buts
  );

  const topAssists = [...players].sort(
    (a, b) => b.passes - a.passes
  );

  return (
    <div>
    

      <h2>⚽ Meilleurs buteurs</h2>

      {topScorers.map((player, index) => (
        <div key={`buts-${player.id}`}>
          {index + 1}. {player.nom} - {player.buts} buts
        </div>
      ))}

      <br />

      <h2>🎯 Meilleurs passeurs</h2>

      {topAssists.map((player, index) => (
        <div key={`passes-${player.id}`}>
          {index + 1}. {player.nom} - {player.passes} passes
        </div>
      ))}
    </div>
  );
}

export default Rankings;