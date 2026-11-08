import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Results() {
  const [matches, setMatches] = useState<any[]>([]);

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
    };

    loadMatches();
  }, []);

  return (
    <div>
      <h1>⚽ Résultats</h1>

      {matches.map((match) => (
        <div
          key={match.id}
          style={{
            padding: "12px",
            marginBottom: "12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <strong>
            US NUBAR {match.score_us_nubar} - {match.score_adverse}{" "}
            {match.adversaire}
          </strong>

          <div>📍 {match.lieu}</div>

          <div>📅 {match.date_match}</div>
        </div>
      ))}
    </div>
  );
}

export default Results;
