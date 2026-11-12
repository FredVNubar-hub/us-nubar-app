import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentPlayer } from "../lib/currentPlayer";
import { Link } from "react-router-dom";

function MarcelDor() {
  const [winners, setWinners] = useState<any[]>([]);
  const [nominations, setNominations] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [myVote, setMyVote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();

  const loadData = async () => {
    setLoading(true);
    const player = await getCurrentPlayer();
    setCurrentPlayer(player);

    const { data: winnersData } = await supabase
      .from("marcel_dor")
      .select("*")
      .order("annee", { ascending: false });
    setWinners(winnersData || []);

    const { data: playersData } = await supabase
      .from("joueurs")
      .select("*")
      .eq("actif", true)
      .order("nom", { ascending: true });
    setPlayers(playersData || []);

    const { data: nomData } = await supabase
      .from("nominations")
      .select("*")
      .eq("trophee", "marcel_dor")
      .eq("annee", currentYear)
      .order("created_at", { ascending: true });
    setNominations(nomData || []);

    const { data: votesData } = await supabase
      .from("votes")
      .select("*")
      .eq("trophee", "marcel_dor")
      .eq("annee", currentYear);
    setVotes(votesData || []);

    if (player && votesData) {
      const existing = votesData.find((v) => v.votant_id === player.id);
      setMyVote(existing || null);
      if (existing) setSelectedCandidate(String(existing.candidat_id));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const isAdmin = currentPlayer?.role === "admin";
  const isVoteOpen = nominations.some((n) => n.vote_ouvert === true);
  const isAlreadyPublished = winners.some((w) => w.annee === currentYear);

  const getPlayerName = (id: number) => {
    const p = players.find((item) => item.id === id);
    return p ? p.nom : `Joueur #${id}`;
  };

  const toggleVoteStatus = async () => {
    const nextState = !isVoteOpen;
    const { error } = await supabase
      .from("nominations")
      .update({ vote_ouvert: nextState })
      .eq("trophee", "marcel_dor")
      .eq("annee", currentYear);

    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
      return;
    }
    loadData();
  };

  const submitVote = async () => {
    if (!currentPlayer || !selectedCandidate) {
      alert("Veuillez choisir un joueur.");
      return;
    }

    if (myVote) {
      const { error } = await supabase
        .from("votes")
        .update({ candidat_id: Number(selectedCandidate) })
        .eq("id", myVote.id);
      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("votes").insert([
        {
          trophee: "marcel_dor",
          annee: currentYear,
          votant_id: currentPlayer.id,
          candidat_id: Number(selectedCandidate),
        },
      ]);
      if (error) {
        alert(error.message);
        return;
      }
    }

    alert("✅ Vote secret enregistré !");
    loadData();
  };

  const publishWinner = async () => {
    if (votes.length === 0) {
      alert("Aucun vote enregistré pour le moment.");
      return;
    }

    const counts: Record<number, number> = {};
    votes.forEach((v) => {
      counts[v.candidat_id] = (counts[v.candidat_id] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([id, count]) => ({ id: Number(id), count }))
      .sort((a, b) => b.count - a.count);

    const winnerName = getPlayerName(sorted[0].id);
    const fin1 = sorted[1] ? getPlayerName(sorted[1].id) : null;
    const fin2 = sorted[2] ? getPlayerName(sorted[2].id) : null;
    const fin3 = sorted[3] ? getPlayerName(sorted[3].id) : null;

    const { error } = await supabase.from("marcel_dor").insert([
      {
        annee: currentYear,
        vainqueur: winnerName,
        finaliste_1: fin1,
        finaliste_2: fin2,
        finaliste_3: fin3,
        description: `Élu par les joueurs de l'US Nubar (${votes.length} votes).`,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    await supabase
      .from("nominations")
      .update({ vote_ouvert: false })
      .eq("trophee", "marcel_dor")
      .eq("annee", currentYear);

    alert(`🏆 Palmarès ${currentYear} publié ! Vainqueur : ${winnerName}`);
    loadData();
  };

  const uniqueNomineeIds = Array.from(new Set(nominations.map((n) => n.joueur_id)));

  const voteCounts: Record<number, number> = {};
  votes.forEach((v) => {
    voteCounts[v.candidat_id] = (voteCounts[v.candidat_id] || 0) + 1;
  });

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <Link
        to="/more"
        style={{
          textDecoration: "none",
          color: "#1009E6",
          fontWeight: "bold",
        }}
      >
        ← Retour à Autres
      </Link>

      <h1 style={{ color: "#1009E6", textAlign: "center", marginTop: "20px" }}>
        🏆 Marcel d'Or
      </h1>

      <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(16,9,230,0.12)",
          border: "1px solid #E5E7EB",
          marginBottom: "25px",
        }}
      >
        <h2 style={{ color: "#1009E6", marginTop: 0 }}>
          ⭐ Nominés de la saison {currentYear}
        </h2>

        {nominations.length === 0 ? (
          <p style={{ color: "#666" }}>
            Aucun joueur n'a encore été nominé cette saison.
          </p>
        ) : (
          <ul style={{ paddingLeft: "20px" }}>
            {nominations.map((nom) => (
              <li key={nom.id} style={{ marginBottom: "8px" }}>
                <strong>{getPlayerName(nom.joueur_id)}</strong>
                {nom.commentaire ? ` — ${nom.commentaire}` : ""}
              </li>
            ))}
          </ul>
        )}

        {isAdmin && nominations.length > 0 && !isAlreadyPublished && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#F0F4FF",
              borderRadius: "12px",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#1009E6" }}>
              🔐 Administration des votes
            </h3>

            <button
              onClick={toggleVoteStatus}
              style={{
                backgroundColor: isVoteOpen ? "#d32f2f" : "#2e7d32",
                color: "#FFFFFF",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {isVoteOpen
                ? "🔒 Fermer les votes aux joueurs"
                : "🔓 Ouvrir les votes aux joueurs"}
            </button>

            <div style={{ marginTop: "15px" }}>
              <strong>Dépouillement en direct ({votes.length} vote(s)) :</strong>
              {uniqueNomineeIds.map((id) => (
                <p key={id} style={{ margin: "5px 0" }}>
                  • {getPlayerName(id)} : <strong>{voteCounts[id] || 0} voix</strong>
                </p>
              ))}
            </div>

            {votes.length > 0 && (
              <button
                onClick={publishWinner}
                style={{
                  marginTop: "10px",
                  backgroundColor: "#1009E6",
                  color: "#FFFFFF",
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                🏆 Clôturer et publier le palmarès {currentYear}
              </button>
            )}
          </div>
        )}

        {currentPlayer && isVoteOpen && !isAlreadyPublished && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#FFFBEB",
              border: "1px solid #FCD34D",
              borderRadius: "12px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>🗳️ Voter pour le Marcel d'Or {currentYear}</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>
              Votre vote est strictement secret. Vous pouvez modifier votre choix tant que le vote est ouvert.
            </p>

            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              style={{ padding: "8px", borderRadius: "8px", marginRight: "10px" }}
            >
              <option value="">Choisir parmi les nominés</option>
              {uniqueNomineeIds.map((id) => (
                <option key={id} value={id}>
                  {getPlayerName(id)}
                </option>
              ))}
            </select>

            <button
              onClick={submitVote}
              style={{
                backgroundColor: "#1009E6",
                color: "#FFFFFF",
                padding: "8px 16px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {myVote ? "Modifier mon vote" : "Valider mon vote"}
            </button>
          </div>
        )}
      </div>

      {winners.length > 0 && (
        <h2 style={{ color: "#1009E6", marginBottom: "15px" }}>
          📜 Palmarès historique
        </h2>
      )}

      {winners.map((winner) => (
        <div
          key={winner.id}
          style={{
            backgroundColor: "#FFFFFF",
            padding: "25px",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(16,9,230,0.15)",
            border: "1px solid #E5E7EB",
            marginTop: "15px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              marginBottom: "15px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: "22px" }}>
              {winner.annee}
            </span>

            <span
              style={{
                backgroundColor: "#FFD700",
                color: "#333333",
                padding: "6px 12px",
                borderRadius: "20px",
                fontWeight: "bold",
              }}
            >
              👑 {winner.vainqueur}
            </span>

            {[winner.finaliste_1, winner.finaliste_2, winner.finaliste_3].filter(
              Boolean
            ).length > 0 && (
              <span
                style={{
                  border: "2px solid #C0C0C0",
                  color: "#666666",
                  backgroundColor: "#F8F8F8",
                  padding: "6px 12px",
                  borderRadius: "20px",
                }}
              >
                🥈{" "}
                {[winner.finaliste_1, winner.finaliste_2, winner.finaliste_3]
                  .filter(Boolean)
                  .join(" • ")}
              </span>
            )}
          </div>

          <p>📝 {winner.description}</p>
        </div>
      ))}
    </div>
  );
}

export default MarcelDor;
