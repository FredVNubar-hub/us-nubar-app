import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Rankings() {
  const [activeTab, setActiveTab] = useState<"buts" | "passes" | "matchs">("buts");
  const [players, setPlayers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [finishedMatchIds, setFinishedMatchIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const { data: playersData } = await supabase.from("joueurs").select("*");
      const { data: eventsData } = await supabase.from("evenements_match").select("*");
      const { data: availData } = await supabase.from("disponibilites").select("*");
      const { data: matchsData } = await supabase
        .from("matchs")
        .select("id")
        .eq("statut", "termine");

      setPlayers(playersData || []);
      setEvents(eventsData || []);
      setAvailabilities(availData || []);
      setFinishedMatchIds((matchsData || []).map((m) => m.id));
      setLoading(false);
    };

    loadStats();
  }, []);

  const statsList = players.map((player) => {
    const buts = events.filter(
      (e) => e.equipe === "nubar" && e.buteur_id === player.id
    ).length;

    const passes = events.filter(
      (e) => e.equipe === "nubar" && e.passeur_id === player.id
    ).length;

    const matchsJoues = availabilities.filter(
      (a) =>
        a.joueur_id === player.id &&
        a.statut === "present" &&
        finishedMatchIds.includes(a.match_id)
    ).length;

    const ratioButs = matchsJoues > 0 ? (buts / matchsJoues).toFixed(2) : "0.00";
    const ratioPasses = matchsJoues > 0 ? (passes / matchsJoues).toFixed(2) : "0.00";

    return {
      ...player,
      buts,
      passes,
      matchsJoues,
      ratioButs,
      ratioPasses,
    };
  });

  const sortedPlayers = [...statsList].sort((a, b) => {
    if (activeTab === "buts") {
      if (b.buts !== a.buts) return b.buts - a.buts;
      return Number(b.ratioButs) - Number(a.ratioButs);
    }
    if (activeTab === "passes") {
      if (b.passes !== a.passes) return b.passes - a.passes;
      return Number(b.ratioPasses) - Number(a.ratioPasses);
    }
    if (b.matchsJoues !== a.matchsJoues) return b.matchsJoues - a.matchsJoues;
    return b.buts - a.buts;
  });

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  const tabBtn = (tab: "buts" | "passes" | "matchs") => ({
    flex: 1,
    padding: "10px 6px",
    borderRadius: "10px",
    border: "2px solid #1009E6",
    backgroundColor: activeTab === tab ? "#1009E6" : "#FFFFFF",
    color: activeTab === tab ? "#FFFFFF" : "#1009E6",
    fontWeight: "bold" as const,
    fontSize: "13px",
  });

  if (loading) return <p>Chargement des classements...</p>;

  return (
    <div>
      <h1 style={{ color: "#1009E6", fontSize: "24px", marginBottom: "14px" }}>
        🏆 Classements
      </h1>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        <button style={tabBtn("buts")} onClick={() => setActiveTab("buts")}>
          ⚽ Buteurs
        </button>
        <button style={tabBtn("passes")} onClick={() => setActiveTab("passes")}>
          🎯 Passeurs
        </button>
        <button style={tabBtn("matchs")} onClick={() => setActiveTab("matchs")}>
          👕 Matchs
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {sortedPlayers.map((player, index) => (
          <Link
            key={player.id}
            to={`/player/${player.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "10px 14px",
                borderRadius: "12px",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.05)",
                border: index === 0 ? "2px solid #FACC15" : "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "28px",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: index < 3 ? "18px" : "14px",
                    color: "#64748B",
                    flexShrink: 0,
                  }}
                >
                  {getMedal(index)}
                </span>

                <div>
                  <div style={{ fontWeight: "bold", color: "#0F172A", fontSize: "15px" }}>
                    {player.nom}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    {player.matchsJoues} match{player.matchsJoues > 1 ? "s" : ""} joué
                    {player.matchsJoues > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {activeTab === "buts" && (
                  <>
                    <div style={{ fontWeight: "bold", color: "#1009E6", fontSize: "16px" }}>
                      {player.buts} but{player.buts > 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>
                      {player.ratioButs} / match
                    </div>
                  </>
                )}

                {activeTab === "passes" && (
                  <>
                    <div style={{ fontWeight: "bold", color: "#1009E6", fontSize: "16px" }}>
                      {player.passes} passe{player.passes > 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>
                      {player.ratioPasses} / match
                    </div>
                  </>
                )}

                {activeTab === "matchs" && (
                  <>
                    <div style={{ fontWeight: "bold", color: "#1009E6", fontSize: "16px" }}>
                      {player.matchsJoues} match{player.matchsJoues > 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>
                      {finishedMatchIds.length > 0
                        ? `${Math.round((player.matchsJoues / finishedMatchIds.length) * 100)}% présence`
                        : "0%"}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Rankings;
