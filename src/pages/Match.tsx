import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Match() {
  const { id } = useParams();
  console.log("Match ID URL =", id);

  const [match, setMatch] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
const [selectedStatus, setSelectedStatus] = useState("present");


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
const presents = availability.filter(
  (item) => item.statut === "present"
);

const incertains = availability.filter(
  (item) => item.statut === "incertain"
);

const absents = availability.filter(
  (item) => item.statut === "absent"
);
const sansReponse = players.filter(
  (player) =>
    !availability.some(
      (item) => item.joueur_id === player.id
    )
);
const addAvailability = async () => {

  const existing = availability.find(
    (item) => item.joueur_id === Number(selectedPlayer)
  );

  if (existing) {

    const { error } = await supabase
      .from("disponibilites")
      .update({
        statut: selectedStatus,
      })
      .eq("id", existing.id);

    if (error) {
      console.error(error);
      return;
    }

  } else {

    const { error } = await supabase
      .from("disponibilites")
      .insert([
        {
          match_id: Number(id),
          joueur_id: Number(selectedPlayer),
          statut: selectedStatus,
        },
      ]);

    if (error) {
      console.error(error);
      return;
    }
  }

  window.location.reload();
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
<div style={{ marginBottom: "20px" }}>
  <select
    value={selectedPlayer}
    onChange={(e) => setSelectedPlayer(e.target.value)}
  >
    <option value="">Choisir un joueur</option>

    {players.map((player) => (
      <option key={player.id} value={player.id}>
        {player.nom}
      </option>
    ))}
  </select>

  <select
    value={selectedStatus}
    onChange={(e) => setSelectedStatus(e.target.value)}
    style={{ marginLeft: "10px" }}
  >
    <option value="present">✅ Présent</option>
    <option value="incertain">❓ Incertain</option>
    <option value="absent">❌ Absent</option>
  </select>

  <button
    onClick={addAvailability}
    style={{ marginLeft: "10px" }}
  >
    Ajouter
  </button>
</div>

<h3>✅ Présents ({presents.length})</h3>

{presents.map((item) => (
  <p key={item.id}>
    {getPlayerName(item.joueur_id)}
  </p>
))}

<h3>❓ Incertains ({incertains.length})</h3>

{incertains.map((item) => (
  <p key={item.id}>
    {getPlayerName(item.joueur_id)}
  </p>
))}

<h3>❌ Absents ({absents.length})</h3>

{absents.map((item) => (
  <p key={item.id}>
    {getPlayerName(item.joueur_id)}
  </p>
))}
<h3>⏳ Sans réponse ({sansReponse.length})</h3>

{sansReponse.map((player) => (
  <p key={player.id}>
    {player.nom}
  </p>
))}
    </div>
  );
}

export default Match;