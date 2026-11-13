import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function MatchApres({ match, players, events, availability, currentPlayer, isAdmin, onReload }: any) {
  const [editScoreNubar, setEditScoreNubar] = useState<number>(match.score_us_nubar ?? 0);
  const [editScoreAdverse, setEditScoreAdverse] = useState<number>(match.score_adverse ?? 0);
  const [nomPlayerId, setNomPlayerId] = useState("");
  const [nomTrophee, setNomTrophee] = useState("marcel_dor");
  const [nomCommentaire, setNomCommentaire] = useState("");

  const [motmVotes, setMotmVotes] = useState<any[]>([]);
  const [selectedMotm, setSelectedMotm] = useState("");
  const [myMotmVote, setMyMotmVote] = useState<any>(null);

  const loadMotmVotes = async () => {
    const { data } = await supabase
      .from("votes")
      .select("*")
      .eq("trophee", "homme_du_match")
      .eq("match_id", match.id);

    setMotmVotes(data || []);
    if (currentPlayer && data) {
      const existing = data.find((v: any) => v.votant_id === currentPlayer.id);
      setMyMotmVote(existing || null);
      if (existing) setSelectedMotm(String(existing.candidat_id));
    }
  };

  useEffect(() => {
    loadMotmVotes();
  }, [match.id, currentPlayer]);

  const getPlayerName = (id: number) => players.find((p: any) => p.id === id)?.nom || `ID ${id}`;
  const isFinished = match.statut === "termine";

  const presentIds = availability
    .filter((a: any) => a.statut === "present")
    .map((a: any) => a.joueur_id);
  const eligiblePlayers = presentIds.length > 0
    ? players.filter((p: any) => presentIds.includes(p.id))
    : players;

  const submitMotmVote = async () => {
    if (!currentPlayer || !selectedMotm) {
      alert("Veuillez choisir un joueur.");
      return;
    }

    if (myMotmVote) {
      const { error } = await supabase
        .from("votes")
        .update({ candidat_id: Number(selectedMotm) })
        .eq("id", myMotmVote.id);
      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("votes").insert([
        {
          trophee: "homme_du_match",
          annee: new Date(match.date_match).getFullYear(),
          match_id: match.id,
          votant_id: currentPlayer.id,
          candidat_id: Number(selectedMotm),
        },
      ]);
      if (error) {
        alert(error.message);
        return;
      }
    }

    alert("✅ Vote secret enregistré !");
    loadMotmVotes();
  };

  const designateMotm = async () => {
    if (motmVotes.length === 0) {
      alert("Aucun vote enregistré pour ce match.");
      return;
    }

    const counts: Record<number, number> = {};
    motmVotes.forEach((v: any) => {
      counts[v.candidat_id] = (counts[v.candidat_id] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([id, count]) => ({ id: Number(id), count }))
      .sort((a, b) => b.count - a.count);

    const winnerId = sorted[0].id;
    const winnerPlayer = players.find((p: any) => p.id === winnerId);

    await supabase
      .from("matchs")
      .update({ homme_du_match_id: winnerId })
      .eq("id", match.id);

    if (winnerPlayer) {
      await supabase
        .from("joueurs")
        .update({ hommes_du_match: (winnerPlayer.hommes_du_match || 0) + 1 })
        .eq("id", winnerId);
    }

    alert(`🏅 ${getPlayerName(winnerId)} est élu Homme du Match !`);
    onReload();
  };

  const deleteEvent = async (eventId: number) => {
    if (!window.confirm("Supprimer ce but ?")) return;
    await supabase.from("evenements_match").delete().eq("id", eventId);
    onReload();
  };

  const updateFinalScore = async () => {
    await supabase
      .from("matchs")
      .update({
        score_us_nubar: Number(editScoreNubar),
        score_adverse: Number(editScoreAdverse),
      })
      .eq("id", match.id);
    alert("✅ Score mis à jour !");
    onReload();
  };

  const finishMatch = async () => {
    const butsNubar = events.filter((e: any) => e.equipe === "nubar").length;
    const butsAdverses = events.filter((e: any) => e.equipe === "adverse").length;
    await supabase
      .from("matchs")
      .update({
        statut: "termine",
        score_us_nubar: butsNubar,
        score_adverse: butsAdverses,
      })
      .eq("id", match.id);
    onReload();
  };

  const reopenMatch = async () => {
    await supabase.from("matchs").update({ statut: "en_cours" }).eq("id", match.id);
    onReload();
  };

  const addNomination = async () => {
    if (!nomPlayerId) {
      alert("Veuillez choisir un joueur à nominer.");
      return;
    }
    const currentYear = new Date().getFullYear();
    const { error } = await supabase.from("nominations").insert([
      {
        trophee: nomTrophee,
        annee: currentYear,
        joueur_id: Number(nomPlayerId),
        match_id: match.id,
        commentaire: nomCommentaire,
        vote_ouvert: false,
      },
    ]);

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }
    alert("⭐ Nomination enregistrée !");
    setNomPlayerId("");
    setNomCommentaire("");
  };

  const motmCounts: Record<number, number> = {};
  motmVotes.forEach((v: any) => {
    motmCounts[v.candidat_id] = (motmCounts[v.candidat_id] || 0) + 1;
  });

  const card = { backgroundColor: "#FFF", padding: "20px", borderRadius: "16px", border: "1px solid #E5E7EB", marginBottom: "20px" };
  return (
    <div>
      {/* ENCADRÉ HOMME DU MATCH */}
      <div style={card}>
        <h2 style={{ color: "#1009E6", marginTop: 0 }}>🏅 Homme du Match</h2>

        {match.homme_du_match_id ? (
          <div
            style={{
              backgroundColor: "#FEF3C7",
              border: "2px solid #F59E0B",
              padding: "14px",
              borderRadius: "12px",
              textAlign: "center",
              fontWeight: "bold",
              color: "#92400E",
              fontSize: "17px",
            }}
          >
            👑 Élu Homme du Match : {getPlayerName(match.homme_du_match_id)}
          </div>
        ) : isFinished ? (
          <>
            {currentPlayer ? (
              <div
                style={{
                  backgroundColor: "#FFFBEB",
                  border: "1px solid #FCD34D",
                  padding: "14px",
                  borderRadius: "12px",
                }}
              >
                <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#555" }}>
                  🗳️ Vote secret ouvert à tout l'effectif (choisissez parmi les joueurs présents au match) :
                </p>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <select
                    value={selectedMotm}
                    onChange={(e) => setSelectedMotm(e.target.value)}
                    style={{ padding: "8px", borderRadius: "8px", flex: 1, minWidth: "160px" }}
                  >
                    <option value="">Choisir l'Homme du Match</option>
                    {eligiblePlayers.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.nom}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={submitMotmVote}
                    style={{
                      backgroundColor: "#1009E6",
                      color: "#FFF",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    {myMotmVote ? "Modifier mon vote" : "Voter"}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: "#666", fontSize: "14px" }}>
                Connectez-vous pour voter pour l'Homme du Match.
              </p>
            )}

            {isAdmin && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "14px",
                  backgroundColor: "#F0F4FF",
                  borderRadius: "12px",
                }}
              >
                <strong style={{ color: "#1009E6" }}>
                  🔐 Dépouillement Admin ({motmVotes.length} vote{motmVotes.length > 1 ? "s" : ""}) :
                </strong>

                {eligiblePlayers.map((p: any) => (
                  <div key={p.id} style={{ fontSize: "14px", marginTop: "4px" }}>
                    • {p.nom} : <strong>{motmCounts[p.id] || 0} voix</strong>
                  </div>
                ))}

                {motmVotes.length > 0 && (
                  <button
                    onClick={designateMotm}
                    style={{
                      marginTop: "12px",
                      backgroundColor: "#2e7d32",
                      color: "#FFF",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    🏅 Clôturer et désigner l'Homme du Match
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <p style={{ color: "#666", fontSize: "14px" }}>
            Le vote pour l'Homme du Match sera disponible dès que le match sera terminé.
          </p>
        )}
      </div>

      {/* RÉSUMÉ & BUTEURS */}
      <div style={card}>
        <h2 style={{ color: "#1009E6", marginTop: 0 }}>📊 Résumé & Buteurs</h2>

        {events.length === 0 ? (
          <p style={{ color: "#666" }}>Aucun détail de but enregistré pour ce match.</p>
        ) : (
          events.map((event: any) => (
            <div
              key={event.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid #EEE",
              }}
            >
              <span>
                {event.equipe === "adverse" ? (
                  <>⚽ {event.minute}' But {match.adversaire}</>
                ) : (
                  <>
                    ⚽ {event.minute}' <strong>{getPlayerName(event.buteur_id)}</strong>
                    {event.passeur_id && ` (passe : ${getPlayerName(event.passeur_id)})`}
                  </>
                )}
              </span>
              {isAdmin && (
                <button
                  onClick={() => deleteEvent(event.id)}
                  style={{ background: "none", border: "none", color: "#d32f2f", cursor: "pointer" }}
                >
                  ❌
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* OUTILS ADMIN */}
      {isAdmin && (
        <>
          <div style={card}>
            <h3 style={{ color: "#1009E6", marginTop: 0 }}>🛠️ Modifier le match (Admin)</h3>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
              <span>US Nubar :</span>
              <input
                type="number"
                value={editScoreNubar}
                onChange={(e) => setEditScoreNubar(Number(e.target.value))}
                style={{ width: "60px", padding: "6px", borderRadius: "6px", border: "1px solid #CCC" }}
              />
              <span>- {match.adversaire} :</span>
              <input
                type="number"
                value={editScoreAdverse}
                onChange={(e) => setEditScoreAdverse(Number(e.target.value))}
                style={{ width: "60px", padding: "6px", borderRadius: "6px", border: "1px solid #CCC" }}
              />
              <button
                onClick={updateFinalScore}
                style={{
                  backgroundColor: "#1009E6",
                  color: "#FFF",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                Enregistrer le score
              </button>
            </div>

            {isFinished ? (
              <button onClick={reopenMatch} style={{ padding: "8px 14px", borderRadius: "8px" }}>
                🔄 Rouvrir le match en mode Live
              </button>
            ) : (
              <button
                onClick={finishMatch}
                style={{
                  backgroundColor: "#2e7d32",
                  color: "#FFF",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                🏁 Clôturer définitivement le match
              </button>
            )}
          </div>

          <div style={card}>
            <h3 style={{ color: "#1009E6", marginTop: 0 }}>⭐ Nominer pour les trophées</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <select
                value={nomTrophee}
                onChange={(e) => setNomTrophee(e.target.value)}
                style={{ padding: "8px", borderRadius: "8px" }}
              >
                <option value="marcel_dor">🏆 Marcel d'Or</option>
                <option value="puskas">⚽ Prix Puskas</option>
              </select>

              <select
                value={nomPlayerId}
                onChange={(e) => setNomPlayerId(e.target.value)}
                style={{ padding: "8px", borderRadius: "8px" }}
              >
                <option value="">Choisir le joueur à nominer</option>
                {players.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Justification (ex : Raté à 2m, lucarne...)"
                value={nomCommentaire}
                onChange={(e) => setNomCommentaire(e.target.value)}
                style={{ padding: "8px", borderRadius: "8px", border: "1px solid #CCC" }}
              />

              <button
                onClick={addNomination}
                style={{
                  backgroundColor: "#1009E6",
                  color: "#FFF",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                Ajouter la nomination
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MatchApres;
