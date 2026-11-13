import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

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
        .order("date_match", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(error);
      } else {
        setNextMatch(data);
      }

      const { data: lastData, error: lastError } = await supabase
        .from("matchs")
        .select("*")
        .eq("statut", "termine")
        .order("date_match", { ascending: false })
        .limit(1)
        .maybeSingle();

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
          (total, match) => total + (match.score_us_nubar || 0),
          0
        );

        const goalsAgainstCount = allMatches.reduce(
          (total, match) => total + (match.score_adverse || 0),
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
      <h2 style={{ color: "#1009E6" }}>📅 Prochain match</h2>

      {nextMatch ? (
        <Link
          to={`/match/${nextMatch.id}`}
          style={{ textDecoration: "none", color: "inherit", display: "block" }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(16,9,230,0.12)",
              maxWidth: "700px",
              margin: "0 auto",
              border: "1px solid #E5E7EB",
            }}
          >
            <h3
              style={{
                color: "#1009E6",
                marginTop: 0,
                marginBottom: "12px",
              }}
            >
              ⚽ US NUBAR - {nextMatch.adversaire}
            </h3>

            <div style={{ marginBottom: "6px" }}>📍 {nextMatch.lieu}</div>

            <div>
              📅{" "}
              {new Date(nextMatch.date_match).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              à{" "}
              {new Date(nextMatch.date_match).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <div
              style={{
                marginTop: "12px",
                color: "#1009E6",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Voir la fiche et indiquer sa présence →
            </div>
          </div>
        </Link>
      ) : (
        <p style={{ color: "#666" }}>Aucun match programmé</p>
      )}

      <h2 style={{ color: "#1009E6", marginTop: "35px" }}>
        🏁 Dernier résultat
      </h2>

      {lastMatch ? (
        <Link
          to={`/match/${lastMatch.id}`}
          style={{ textDecoration: "none", color: "inherit", display: "block" }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "20px",
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
                marginTop: 0,
                marginBottom: "12px",
              }}
            >
              ⚽ US NUBAR {lastMatch.score_us_nubar} - {lastMatch.score_adverse}{" "}
              {lastMatch.adversaire}
            </h3>

            <div style={{ marginBottom: "6px" }}>📍 {lastMatch.lieu}</div>

            <div>
              📅{" "}
              {new Date(lastMatch.date_match).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>

            <div
              style={{
                marginTop: "12px",
                color: "#1009E6",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Voir le résumé du match →
            </div>
          </div>
        </Link>
      ) : (
        <p style={{ color: "#666" }}>Aucun match terminé</p>
      )}

      <h2 style={{ color: "#1009E6", marginTop: "35px" }}>📊 Bilan saison</h2>

      <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(11,79,125,0.12)",
          border: "1px solid #E5E7EB",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <p style={{ margin: "8px 0" }}>✅ Victoires : <strong>{wins}</strong></p>
        <p style={{ margin: "8px 0" }}>➖ Nuls : <strong>{draws}</strong></p>
        <p style={{ margin: "8px 0" }}>❌ Défaites : <strong>{losses}</strong></p>

        <hr style={{ borderColor: "#E5E7EB", margin: "12px 0" }} />

        <p style={{ margin: "8px 0" }}>⚽ Buts marqués : <strong>{goalsFor}</strong></p>
        <p style={{ margin: "8px 0" }}>🥅 Buts encaissés : <strong>{goalsAgainst}</strong></p>
      </div>
    </div>
  );
}

export default Home;
