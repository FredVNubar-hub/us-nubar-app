import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

function Results() {
  const [matches, setMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);

  useEffect(() => {
    const loadMatches = async () => {
      const { data, error } = await supabase
        .from("matchs")
        .select("*")
        .eq("statut", "termine")
        .order("date_match", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setMatches(data || []);

      const { data: upcomingData } = await supabase
      .from("matchs")
      .select("*")
      .eq("statut", "a_venir")
      .order("date_match", { ascending: true });

if (upcomingData) {
  setUpcomingMatches(upcomingData);
}
    };

    loadMatches();
  }, []);

  return (
  <div>

    <h2
      style={{
        color: "#1009E6",
        marginBottom: "20px",
      }}
    >
      📅 À venir
    </h2>

    {upcomingMatches.map((match) => (
      <Link
  key={match.id}
  to={`/match/${match.id}`}
  style={{
    textDecoration: "none",
    color: "inherit",
  }}
>
  <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: "25px",
          marginBottom: "20px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(16,9,230,0.15)",
          border: "1px solid #E5E7EB",
        }}
      >
        <h3
          style={{
            color: "#1009E6",
            marginTop: 0,
          }}
        >
          ⚽ US NUBAR - {match.adversaire}
        </h3>

        <div>📍 {match.lieu}</div>

        <div>
          📅{" "}
          {new Date(match.date_match).toLocaleDateString(
            "fr-FR",
            {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          )}
        </div>
        </div>
</Link>
    ))}

    <h2
      style={{
        color: "#1009E6",
        marginTop: "40px",
        marginBottom: "20px",
      }}
    >
      🏁 Résultats
    </h2>

    {matches.map((match) => (
        <div
          key={match.id}
          style={{
  backgroundColor: "#FFFFFF",
  padding: "25px",
  marginBottom: "20px",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(11,79,125,0.12)",
  border: "1px solid #E5E7EB",
}}
        >
          <h3
  style={{
    color: "#1009E6",
    marginTop: 0,
  }}
>
  ⚽ US NUBAR {match.score_us_nubar} - {match.score_adverse}{" "}
  {match.adversaire}
</h3>

          <div>📍 {match.lieu}</div>

          <div>
  📅{" "}
  {new Date(match.date_match).toLocaleDateString(
    "fr-FR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  )}{" "}
  à{" "}
  {new Date(match.date_match).toLocaleTimeString(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )}
</div>
        </div>
      ))}
    </div>
  );
}

export default Results;
