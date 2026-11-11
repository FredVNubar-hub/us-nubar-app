import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Rankings() {
  const [players, setPlayers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

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
      const { data: eventsData, error: eventsError } =
      await supabase
      .from("evenements_match")
      .select("*");

      if (eventsError) {
      console.error(eventsError);
      return;
      }

setEvents(eventsData || []);
    };

    loadPlayers();
  }, []);

  const playersWithStats = players.map((player) => {
  const buts = events.filter(
    (event) =>
      event.equipe === "nubar" &&
      event.buteur_id === player.id
  ).length;

  const passes = events.filter(
    (event) =>
      event.equipe === "nubar" &&
      event.passeur_id === player.id
  ).length;

  return {
    ...player,
    buts,
    passes,
  };
});

  const topScorers = [...playersWithStats].sort(
  (a, b) => b.buts - a.buts
);

const topAssists = [...playersWithStats].sort(
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