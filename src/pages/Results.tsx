import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentPlayer } from "../lib/currentPlayer";
import { Link } from "react-router-dom";

function Results() {
  const [activeTab, setActiveTab] = useState<"a_venir" | "termine">("a_venir");
  const [matches, setMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [adversaire, setAdversaire] = useState("");
  const [dateMatch, setDateMatch] = useState("");
  const [lieu, setLieu] = useState("");

  const loadMatches = async () => {
    const player = await getCurrentPlayer();
    setCurrentPlayer(player);

    const { data: finishedData } = await supabase
      .from("matchs")
      .select("*")
      .eq("statut", "termine")
      .order("date_match", { ascending: false });
    setMatches(finishedData || []);

    const { data: upcomingData } = await supabase
      .from("matchs")
      .select("*")
      .neq("statut", "termine")
      .order("date_match", { ascending: true });
    setUpcomingMatches(upcomingData || []);

    if ((!upcomingData || upcomingData.length === 0) && finishedData && finishedData.length > 0) {
      setActiveTab("termine");
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const isAdmin = currentPlayer?.role === "admin";

  const createMatch = async () => {
    if (!adversaire || !dateMatch || !lieu) {
      alert("Veuillez remplir l'adversaire, la date/heure et le lieu.");
      return;
    }

    const { error } = await supabase.from("matchs").insert([
      {
        adversaire,
        date_match: new Date(dateMatch).toISOString(),
        lieu,
        statut: "a_venir",
        score_us_nubar: 0,
        score_adverse: 0,
      },
    ]);

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

    setAdversaire("");
    setDateMatch("");
    setLieu("");
    setShowAddForm(false);
    setActiveTab("a_venir");
    loadMatches();
  };

  const getResultBadge = (m: any) => {
    if (m.score_us_nubar > m.score_adverse) {
      return { text: "V", bg: "#DCFCE7", color: "#166534" };
    }
    if (m.score_us_nubar < m.score_adverse) {
      return { text: "D", bg: "#FEE2E2", color: "#991B1B" };
    }
    return { text: "N", bg: "#F3F4F6", color: "#374151" };
  };

  const tabBtn = (active: boolean) => ({
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "2px solid #1009E6",
    backgroundColor: active ? "#1009E6" : "#FFFFFF",
    color: active ? "#FFFFFF" : "#1009E6",
    fontWeight: "bold" as const,
    cursor: "pointer",
    fontSize: "14px",
  });

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} à ${timePart}`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
        <h1 style={{ color: "#1009E6", margin: 0, fontSize: "24px" }}>📅 Calendrier</h1>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: "#1009E6",
              color: "#FFF",
              border: "none",
              padding: "8px 12px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            {showAddForm ? "✖ Fermer" : "➕ Nouveau match"}
          </button>
        )}
      </div>

      {isAdmin && showAddForm && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "16px",
            borderRadius: "12px",
            border: "2px solid #1009E6",
            marginBottom: "15px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input
              type="text"
              placeholder="Adversaire (ex : FC Marseille)"
              value={adversaire}
              onChange={(e) => setAdversaire(e.target.value)}
              style={{ padding: "8px", borderRadius: "8px", border: "1px solid #CCC" }}
            />
            <input
              type="datetime-local"
              value={dateMatch}
              onChange={(e) => setDateMatch(e.target.value)}
              style={{ padding: "8px", borderRadius: "8px", border: "1px solid #CCC" }}
            />
            <input
              type="text"
              placeholder="Lieu (ex : Bois Luzy)"
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
              style={{ padding: "8px", borderRadius: "8px", border: "1px solid #CCC" }}
            />
            <button
              onClick={createMatch}
              style={{
                backgroundColor: "#2e7d32",
                color: "#FFF",
                border: "none",
                padding: "10px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
        <button style={tabBtn(activeTab === "a_venir")} onClick={() => setActiveTab("a_venir")}>
          📅 À venir ({upcomingMatches.length})
        </button>
        <button style={tabBtn(activeTab === "termine")} onClick={() => setActiveTab("termine")}>
          🏁 Terminés ({matches.length})
        </button>
      </div>

      {activeTab === "a_venir" && (
        <div>
          {upcomingMatches.length === 0 ? (
            <p style={{ color: "#666", textAlign: "center", padding: "15px" }}>
              Aucun match à venir programmé.
            </p>
          ) : (
            upcomingMatches.map((match) => (
              <Link
                key={match.id}
                to={`/match/${match.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: "12px 16px",
                    marginBottom: "8px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(16,9,230,0.08)",
                    border: "1px solid #E5E7EB",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", color: "#1009E6", fontSize: "16px" }}>
                      {match.statut === "en_cours" ? "🔴 " : "⚽ "}US NUBAR - {match.adversaire}
                    </div>
                    <div style={{ color: "#666", fontSize: "13px", marginTop: "3px" }}>
                      📅 {formatDateTime(match.date_match)}
                    </div>
                  </div>
                  <span style={{ color: "#1009E6", fontWeight: "bold", fontSize: "16px" }}>→</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === "termine" && (
        <div>
          {matches.length === 0 ? (
            <p style={{ color: "#666", textAlign: "center", padding: "15px" }}>
              Aucun match terminé pour le moment.
            </p>
          ) : (
            matches.map((match) => {
              const badge = getResultBadge(match);
              return (
                <Link
                  key={match.id}
                  to={`/match/${match.id}`}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      padding: "12px 16px",
                      marginBottom: "8px",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(11,79,125,0.06)",
                      border: "1px solid #E5E7EB",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "13px",
                          flexShrink: 0,
                        }}
                      >
                        {badge.text}
                      </span>
                      <div>
                        <div style={{ fontWeight: "bold", color: "#1009E6", fontSize: "16px" }}>
                          US NUBAR {match.score_us_nubar} - {match.score_adverse} {match.adversaire}
                        </div>
                        <div style={{ color: "#666", fontSize: "13px", marginTop: "3px" }}>
                          📅 {formatDateTime(match.date_match)}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: "#1009E6", fontWeight: "bold", fontSize: "16px" }}>→</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default Results;
