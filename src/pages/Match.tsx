import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getCurrentPlayer } from "../lib/currentPlayer";
import MatchAvant from "./MatchAvant";
import MatchLive from "./MatchLive";
import MatchApres from "./MatchApres";

function Match() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"avant" | "live" | "apres">("avant");
  const [match, setMatch] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [composition, setComposition] = useState<any[]>([]);

  const loadAll = async () => {
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
    if (data.statut === "termine") setActiveTab("apres");
    else if (data.statut === "en_cours") setActiveTab("live");

    const player = await getCurrentPlayer();
    setCurrentPlayer(player);

    const { data: avData } = await supabase
      .from("disponibilites")
      .select("*")
      .eq("match_id", Number(id));
    setAvailability(avData || []);

    const { data: plData } = await supabase
      .from("joueurs")
      .select("*")
      .order("nom", { ascending: true });
    setPlayers(plData || []);

    const { data: evData } = await supabase
      .from("evenements_match")
      .select("*")
      .eq("match_id", Number(id))
      .order("minute", { ascending: true });
    setEvents(evData || []);

    const { data: compData } = await supabase
      .from("composition_match")
      .select("*")
      .eq("match_id", Number(id));
    setComposition(compData || []);
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  if (!match) return <p>Chargement...</p>;

  const isAdmin = currentPlayer?.role === "admin";
  const isFinished = match.statut === "termine";
  const butsNubar = isFinished
    ? match.score_us_nubar ?? 0
    : events.filter((e) => e.equipe === "nubar").length;
  const butsAdverse = isFinished
    ? match.score_adverse ?? 0
    : events.filter((e) => e.equipe === "adverse").length;

  const tabStyle = (tab: "avant" | "live" | "apres") => ({
    flex: 1,
    padding: "12px 6px",
    borderRadius: "10px",
    border: "2px solid #1009E6",
    backgroundColor: activeTab === tab ? "#1009E6" : "#FFFFFF",
    color: activeTab === tab ? "#FFFFFF" : "#1009E6",
    fontWeight: "bold" as const,
    cursor: "pointer",
  });

  return (
    <div>
      <Link to="/results" style={{ textDecoration: "none", color: "#1009E6", fontWeight: "bold" }}>
        ← Retour au calendrier
      </Link>

      <div style={{ backgroundColor: "#FFF", padding: "20px", borderRadius: "16px", margin: "15px 0", textAlign: "center", border: "1px solid #E5E7EB" }}>
        <h1 style={{ color: "#1009E6", margin: "0 0 8px 0", fontSize: "24px" }}>
          ⚽ US NUBAR {isFinished || events.length > 0 ? `${butsNubar} - ${butsAdverse}` : "vs"} {match.adversaire}
        </h1>
        <div>📅 {new Date(match.date_match).toLocaleDateString("fr-FR")} • 📍 {match.lieu}</div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button style={tabStyle("avant")} onClick={() => setActiveTab("avant")}>📋 Avant-match</button>
        <button style={tabStyle("live")} onClick={() => setActiveTab("live")}>⏱️ Live</button>
        <button style={tabStyle("apres")} onClick={() => setActiveTab("apres")}>🏁 Après-match</button>
      </div>

      {activeTab === "avant" && (
        <MatchAvant
          matchId={id}
          players={players}
          availability={availability}
          composition={composition}
          currentPlayer={currentPlayer}
          isAdmin={isAdmin}
          onReload={loadAll}
        />
      )}

      {activeTab === "live" && (
        <MatchLive
          match={match}
          players={players}
          events={events}
          isAdmin={isAdmin}
          onReload={loadAll}
        />
      )}

      {activeTab === "apres" && (
        <MatchApres
          match={match}
          players={players}
          events={events}
          availability={availability}
          currentPlayer={currentPlayer}
          isAdmin={isAdmin}
          onReload={loadAll}
        />
      )}
    </div>
  );
}

export default Match;
