import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Match() {
  const { id } = useParams();
  console.log("Match ID URL =", id);

  const [match, setMatch] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
const [selectedStatus, setSelectedStatus] = useState("present");
const [goalMinute, setGoalMinute] = useState("");
const [goalScorer, setGoalScorer] = useState("");
const [goalAssist, setGoalAssist] = useState("");

const [matchStarted, setMatchStarted] = useState(false);
const [secondsElapsed, setSecondsElapsed] = useState(0);
const [halfTime, setHalfTime] = useState(false);
const [secondHalf, setSecondHalf] = useState(false);
const [matchFinished, setMatchFinished] = useState(false);
const [composition, setComposition] = useState<any[]>([]);

const [selectedFormation, setSelectedFormation] = useState("3-2-1");
const [selectedPosition, setSelectedPosition] = useState("gardien");
const [selectedCompositionPlayer, setSelectedCompositionPlayer] = useState("");


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
        const { data: eventsData } = await supabase
        .from("evenements_match")
        .select("*")
        .eq("match_id", Number(id))
        .order("minute", { ascending: true });

        setEvents(eventsData || []);
        const { data: compositionData } = await supabase
        .from("composition_match")
        .select("*")
        .eq("match_id", Number(id));

        setComposition(compositionData || []);


    };

    loadMatch();
  }, [id]);

  useEffect(() => {
  if (!matchStarted) return;

  const interval = setInterval(() => {
    setSecondsElapsed((prev) => prev + 1);
  }, 1000);

  return () => clearInterval(interval);
  }, [matchStarted]);

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
const addGoal = async () => {
  const { error } = await supabase
    .from("evenements_match")
    .insert([
      {
        match_id: Number(id),
        minute: Math.floor(secondsElapsed / 60),
        buteur_id: Number(goalScorer),
        passeur_id: goalAssist
          ? Number(goalAssist)
          : null,
      },
    ]);

  if (error) {
    console.error(error);
    return;
  }

  window.location.reload();
};
const adversaire = match?.adversaire || "";
const addComposition = async () => {
    const existing = composition.find(
  (item) =>
    item.joueur_id === Number(selectedCompositionPlayer)
);

if (existing) {

  const { error } = await supabase
    .from("composition_match")
    .update({
      formation: selectedFormation,
      position: selectedPosition,
    })
    .eq("id", existing.id);

  if (error) {
    console.error(error);
    return;
  }

  window.location.reload();
  return;
}
  const { error } = await supabase
    .from("composition_match")
    .insert([
      {
        match_id: Number(id),
        joueur_id: Number(selectedCompositionPlayer),
        formation: selectedFormation,
        position: selectedPosition,
      },
    ]);

  if (error) {
    console.error(error);
    return;
  }

  window.location.reload();
};
const gardiens = composition.filter(
  (item) => item.position === "gardien"
);

const defenseurs = composition.filter(
  (item) => item.position === "defenseur"
);

const milieux = composition.filter(
  (item) => item.position === "milieu"
);

const attaquants = composition.filter(
  (item) => item.position === "attaquant"
);

const remplacants = composition.filter(
  (item) => item.position === "remplacant"
);

const gardien = gardiens[0];
const attaquant = attaquants[0];

const defenseur1 = defenseurs[0];
const defenseur2 = defenseurs[1];
const defenseur3 = defenseurs[2];

const milieu1 = milieux[0];
const milieu2 = milieux[1];
const milieu3 = milieux[2];

const joueursComposition = composition.map(
  (item) => ({
    id: item.joueur_id,
    nom: getPlayerName(item.joueur_id),
  })
);

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
<h2 style={{ color: "#1009E6", marginTop: "40px" }}>
  🟢 Composition
</h2>


<select
  value={selectedPosition}
  onChange={(e) => setSelectedPosition(e.target.value)}
>
  <option value="gardien">🥅 Gardien</option>
  <option value="defenseur">🛡️ Défenseur</option>
  <option value="milieu">🎯 Milieu</option>
  <option value="attaquant">⚽ Attaquant</option>
  <option value="remplacant">🟡 Remplaçant</option>
</select>

<br />
<br />

<select
  value={selectedCompositionPlayer}
  onChange={(e) => setSelectedCompositionPlayer(e.target.value)}
>
  <option value="">Choisir un joueur</option>

  {presents.map((item) => (
  <option
    key={item.joueur_id}
    value={item.joueur_id}
  >
    {getPlayerName(item.joueur_id)}
  </option>
))}

</select>

<br />
<br />

<button onClick={addComposition}>
  Ajouter à la composition
</button>
<h3>🥅 Gardien</h3>

{gardiens.map((item) => (
  <p key={item.id}>
    {getPlayerName(item.joueur_id)}
  </p>
))}

<h3>🛡️ Défenseurs</h3>

{defenseurs.map((item) => (
  <p key={item.id}>
    {getPlayerName(item.joueur_id)}
  </p>
))}

<h3>🎯 Milieux</h3>

{milieux.map((item) => (
  <p key={item.id}>
    {getPlayerName(item.joueur_id)}
  </p>
))}

<h3>⚽ Attaquants</h3>

{attaquants.map((item) => (
  <p key={item.id}>
    {getPlayerName(item.joueur_id)}
  </p>
))}

<h3>🟡 Remplaçants</h3>

{remplacants.map((item) => (
  <p key={item.id}>
    {getPlayerName(item.joueur_id)}
  </p>
))}
<h2 style={{ color: "#1009E6", marginTop: "40px" }}>
  🏟️ Terrain
</h2>

<div
  style={{
    border: "2px solid green",
    padding: "20px",
    marginTop: "20px",
    marginBottom: "20px",
    textAlign: "center",
    backgroundColor: "#e8f5e9",
  }}
    >

  <div style={{ marginBottom: "30px" }}>
    ⚽ {attaquant ? getPlayerName(attaquant.joueur_id) : ""}
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "space-around",
      marginBottom: "30px",
    }}
  >
    {milieux.map((item) => (
  <div key={item.id}>
    🎯 {getPlayerName(item.joueur_id)}
  </div>
))}
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "space-around",
      marginBottom: "30px",
    }}
  >
    {defenseurs.map((item) => (
  <div key={item.id}>
    🛡️ {getPlayerName(item.joueur_id)}
  </div>
))}
  </div>

  <div>
    🥅 {gardien ? getPlayerName(gardien.joueur_id) : ""}
  </div>


</div>

<h2 style={{ color: "#1009E6", marginTop: "40px" }}>
  ⚽ Live Match
</h2>

<div style={{ textAlign: "center" }}>
  <h3>
    {secondHalf
      ? "🔵 2ème période"
      : "🟢 1ère période"}
  </h3>
</div>

<div style={{ textAlign: "center", marginBottom: "20px" }}>
  <h3>
    ⏱️ {Math.floor(secondsElapsed / 60)
      .toString()
      .padStart(2, "0")}
    :
    {(secondsElapsed % 60)
      .toString()
      .padStart(2, "0")}
  </h3>
</div>

{halfTime && (
  <h3
    style={{
      textAlign: "center",
      color: "#f57c00",
    }}
  >
    🟡 MI-TEMPS
  </h3>
)}

{matchFinished && (
  <h3
    style={{
      textAlign: "center",
      color: "#d32f2f",
    }}
  >
    ⏹️ MATCH TERMINÉ
  </h3>
)}

{halfTime && (
  <div
    style={{
      textAlign: "center",
      marginBottom: "20px",
    }}
  >
    <button
      onClick={() => {
  setHalfTime(false);
  setSecondHalf(true);

  setSecondsElapsed(25 * 60);

  setMatchStarted(true);
}}
    >
      ▶️ Reprendre la 2ème période
    </button>
  </div>
)}

{!matchFinished && (

<div
  style={{
    textAlign: "center",
    marginBottom: "20px",
  }}
>
  {!matchStarted ? (
  <button
    onClick={() => {
  setHalfTime(false);
  setMatchStarted(true);
}}
  >
    ▶️ Démarrer
  </button>
) : (
  <>
    <button
      onClick={() => setMatchStarted(false)}
    >
      ⏸️ Pause
    </button>

    <button
  style={{ marginLeft: "10px" }}
  onClick={() => {
    if (!secondHalf) {
      setMatchStarted(false);
      setHalfTime(true);
    } else {
      setMatchStarted(false);
      setMatchFinished(true);
    }
  }}
>
  {secondHalf
    ? "⏹️ Fin du match"
    : "🟡 Mi-temps"}
</button>
  </>
)}

</div>

)}

<h3
  style={{
    color: "#1009E6",
    textAlign: "center",
    marginBottom: "20px",
  }}
>
  US NUBAR {events.length} - 0 {adversaire}
</h3>

<div style={{ marginBottom: "20px" }}>

  <select
    value={goalScorer}
    onChange={(e) => setGoalScorer(e.target.value)}
  >
    <option value="">Choisir le buteur</option>

    {joueursComposition.map((player) => (
  <option key={player.id} value={player.id}>
    {player.nom}
  </option>
))}
  </select>

  <br />
  <br />

  <select
    value={goalAssist}
    onChange={(e) => setGoalAssist(e.target.value)}
  >
    <option value="">Pas de passeur</option>

    {joueursComposition.map((player) => (
  <option key={player.id} value={player.id}>
    {player.nom}
  </option>
))}
  </select>

  <br />
  <br />

  <button onClick={addGoal}>
    ⚽ Ajouter un but
  </button>
</div>
<h3 style={{ marginTop: "30px" }}>
  📜 Historique du match
</h3>

{events.map((event) => (
  <p key={event.id}>
    ⚽ {event.minute}' {getPlayerName(event.buteur_id)}

    {event.passeur_id &&
      ` (${getPlayerName(event.passeur_id)})`}
  </p>
))}
    </div>
  );
}

export default Match;