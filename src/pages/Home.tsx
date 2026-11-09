import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Home() {
  const [nextMatch, setNextMatch] = useState<any>(null);
const [lastMatch, setLastMatch] = useState<any>(null);
const [wins, setWins] = useState(0);
const [draws, setDraws] = useState(0);
const [losses, setLosses] = useState(0);
const [goalsFor, setGoalsFor] = useState(0);
const [goalsAgainst, setGoalsAgainst] = useState(0);


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

      setNextMatch(data);
      const { data: lastData, error: lastError } =
  await supabase
    .from("matchs")
    .select("*")
    .eq("statut", "termine")
    .order("date_match", { ascending: false })
    .limit(1)
    .single();

if (lastError) {
  console.error(lastError);
} else {
  setLastMatch(lastData);
}
const { data: allMatches } = await supabase
  .from("matchs")
  .select("*")
  .eq("statut", "termine");

if (allMatches) {
  const winsCount = allMatches.filter(
    (m) => m.score_us_nubar > m.score_adverse
  ).length;

  const drawsCount = allMatches.filter(
    (m) => m.score_us_nubar === m.score_adverse
  ).length;

  const lossesCount = allMatches.filter(
    (m) => m.score_us_nubar < m.score_adverse
  ).length;

  const goalsForCount = allMatches.reduce(
  (total, match) => total + match.score_us_nubar,
  0
);

const goalsAgainstCount = allMatches.reduce(
  (total, match) => total + match.score_adverse,
  0
);

  setWins(winsCount);
  setDraws(drawsCount);
  setLosses(lossesCount);
  setGoalsFor(goalsForCount);
setGoalsAgainst(goalsAgainstCount);
}
    };

    loadMatch();
  }, []);

  return (
    <div>
      

      <h2>Prochain match</h2>

      {nextMatch ? (
        <div
  style={{
    backgroundColor: "#FFFFFF",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    maxWidth: "700px",
    margin: "0 auto",
    border: "1px solid #E5E7EB",
  }}
>
          <h3
  style={{
    color: "#1009E6",
    marginTop: 0,
    marginBottom: "15px",
  }}
>
  ⚽ US NUBAR - {nextMatch.adversaire}
</h3>

          <div>📍 {nextMatch.lieu}</div>

          <div>
  📅{" "}
  {new Date(nextMatch.date_match).toLocaleDateString(
    "fr-FR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  )}{" "}
  à{" "}
  {new Date(nextMatch.date_match).toLocaleTimeString(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )}
</div>
        </div>
      ) : (
        <p>Aucun match programmé</p>
      )}
      <h2 style={{ marginTop: "40px" }}>
  🏁 Dernier résultat
</h2>

{lastMatch && (
  <div
    style={{
      backgroundColor: "#FFFFFF",
      padding: "25px",
      borderRadius: "16px",
      boxShadow: "0 8px 24px rgba(11,79,125,0.12)",
      border: "1px solid #E5E7EB",
      maxWidth: "700px",
      margin: "0 auto",
    }}
  >
    <h3
      style={{
        color: "#1009E6",
      }}
    >
      ⚽ US NUBAR {lastMatch.score_us_nubar} -{" "}
      {lastMatch.score_adverse} {lastMatch.adversaire}
    </h3>

    <div>📍 {lastMatch.lieu}</div>

    <div>
      📅{" "}
      {new Date(
        lastMatch.date_match
      ).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </div>
  </div>
)}
<h2 style={{ marginTop: "40px" }}>
  📊 Bilan saison
</h2>

<div
  style={{
    backgroundColor: "#FFFFFF",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(11,79,125,0.12)",
    border: "1px solid #E5E7EB",
    maxWidth: "700px",
    margin: "0 auto",
  }}
>
  <p>✅ Victoires : {wins}</p>

  <p>➖ Nuls : {draws}</p>

  <p>❌ Défaites : {losses}</p>

  <hr />

<p>⚽ Buts marqués : {goalsFor}</p>

<p>🥅 Buts encaissés : {goalsAgainst}</p>
</div>
    </div>
  );
}

export default Home;
