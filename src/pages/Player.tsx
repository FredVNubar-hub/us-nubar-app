import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Player() {
  const { id } = useParams();

  const [player, setPlayer] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [finishedMatchIds, setFinishedMatchIds] = useState<number[]>([]);

  useEffect(() => {
    const loadPlayer = async () => {
      const { data, error } = await supabase
        .from("joueurs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return;
      }
      setPlayer(data);

      const { data: eventsData } = await supabase
        .from("evenements_match")
        .select("*");
      setEvents(eventsData || []);

      const { data: availData } = await supabase
        .from("disponibilites")
        .select("*")
        .eq("joueur_id", Number(id));
      setAvailabilities(availData || []);

      const { data: matchsData } = await supabase
        .from("matchs")
        .select("id")
        .eq("statut", "termine");
      setFinishedMatchIds((matchsData || []).map((m) => m.id));
    };

    loadPlayer();
  }, [id]);

  if (!player) {
    return <p>Chargement...</p>;
  }

  const buts = events.filter(
    (e) => e.equipe === "nubar" && e.buteur_id === player.id
  ).length;

  const passes = events.filter(
    (e) => e.equipe === "nubar" && e.passeur_id === player.id
  ).length;

  const matchsJoues = availabilities.filter(
    (a) => a.statut === "present" && finishedMatchIds.includes(a.match_id)
  ).length;

  const ratioButs = matchsJoues > 0 ? (buts / matchsJoues).toFixed(2) : "0.00";
  const ratioPasses = matchsJoues > 0 ? (passes / matchsJoues).toFixed(2) : "0.00";

  const cardStyle = {
    backgroundColor: "#FFFFFF",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
    border: "1px solid #E2E8F0",
    marginBottom: "16px",
  };

  return (
    <div>
      <Link
        to="/team"
        style={{ textDecoration: "none", color: "#1009E6", fontWeight: "bold" }}
      >
        ← Retour à l'effectif
      </Link>

      {/* CARTE D'IDENTITÉ DU JOUEUR */}
      <div style={{ ...cardStyle, marginTop: "14px", textAlign: "center" }}>
        {player.photo_url ? (
          <img
            src={player.photo_url}
            alt={player.nom}
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #1009E6",
              marginBottom: "10px",
            }}
          />
        ) : (
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1009E6 0%, #090482 100%)",
              color: "#FFFFFF",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "34px",
              fontWeight: "bold",
              margin: "0 auto 12px auto",
            }}
          >
            {player.numero ? `#${player.numero}` : "👤"}
          </div>
        )}

        <h1 style={{ color: "#0F172A", margin: "0 0 6px 0", fontSize: "24px" }}>
          {player.nom}
        </h1>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
          <span
            style={{
              backgroundColor: "#EEF2FF",
              color: "#1009E6",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            ⚽ {player.poste || "Joueur"}
          </span>
          {player.numero && (
            <span
              style={{
                backgroundColor: "#F1F5F9",
                color: "#334155",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              N° {player.numero}
            </span>
          )}
        </div>

        <div style={{ fontSize: "13px", color: "#64748B" }}>
          🎂 Né le{" "}
          {player.date_naissance
            ? new Date(player.date_naissance).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Non renseigné"}
        </div>
      </div>

      {/* GRILLE DE STATISTIQUES */}
      <div style={cardStyle}>
        <h2 style={{ color: "#1009E6", fontSize: "18px", marginBottom: "14px" }}>
          📊 Statistiques de la saison
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center" }}>
          <div style={{ backgroundColor: "#F8FAFC", padding: "12px 6px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#1009E6" }}>
              {matchsJoues}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#334155" }}>
              Matchs
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
              {finishedMatchIds.length > 0
                ? `${Math.round((matchsJoues / finishedMatchIds.length) * 100)}%`
                : "0%"}
            </div>
          </div>

          <div style={{ backgroundColor: "#F8FAFC", padding: "12px 6px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#1009E6" }}>
              {buts}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#334155" }}>
              Buts
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
              {ratioButs} / m
            </div>
          </div>

          <div style={{ backgroundColor: "#F8FAFC", padding: "12px 6px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#1009E6" }}>
              {passes}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#334155" }}>
              Passes
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
              {ratioPasses} / m
            </div>
          </div>
        </div>
      </div>

      {/* PALMARÈS INDIVIDUEL */}
      <div style={cardStyle}>
        <h2 style={{ color: "#1009E6", fontSize: "18px", marginBottom: "12px" }}>
          🏅 Palmarès & Récompenses
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
          <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "10px" }}>
            🏅 Homme du match : <strong>{player.hommes_du_match || 0}</strong>
          </div>
          <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "10px" }}>
            🏆 Marcel d'Or : <strong>{player.marcel_dor || 0}</strong>
          </div>
          <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "10px" }}>
            ⚽ Prix Puskas : <strong>{player.puskas || 0}</strong>
          </div>
          <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "10px" }}>
            🎖️ Autres : <strong>{player.autres_recompenses || 0}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
