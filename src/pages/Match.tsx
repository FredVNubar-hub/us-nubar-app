import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Match() {
  const { id } = useParams();
  console.log("Match ID URL =", id);

  const [match, setMatch] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);


  useEffect(() => {
    const loadMatch = async () => {
      const { data, error } = await supabase
        .from("matchs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setMatch(data);
      const { data: availabilityData } = await supabase
        .from("disponibilites")
        .select("*")
        .eq("match_id", Number(id));

        console.log("Recherche match_id =", Number(id));
        console.log(availabilityData);
setAvailability(availabilityData || []);
const { data: playersData } = await supabase
  .from("joueurs")
  .select("*");

setPlayers(playersData || []);
    };

    loadMatch();
  }, [id]);

  if (!match) {
    return <p>Chargement...</p>;
  }
  const getPlayerName = (id: number) => {
  const player = players.find((p) => p.id === id);
  return player ? player.nom : `ID ${id}`;
};

  return (
    <div>
      <h1 style={{ color: "#1009E6" }}>
        ⚽ US NUBAR - {match.adversaire}
      </h1>

      <p>
        📅 {new Date(match.date_match).toLocaleDateString("fr-FR")}
      </p>

      <p>
        📍 {match.lieu}
      </p>
      <h2 style={{ color: "#1009E6" }}>
  👥 Disponibilités
</h2>

{availability.map((item) => (
  <p key={item.id}>
    {item.statut === "present" && "✅ "}
    {item.statut === "incertain" && "❓ "}
    {item.statut === "absent" && "❌ "}

    {getPlayerName(item.joueur_id)}
  </p>
))}
    </div>
  );
}

export default Match;