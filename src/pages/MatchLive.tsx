import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function MatchLive({ match, players, events, isAdmin, onReload }: any) {
  const [goalScorer, setGoalScorer] = useState("");
  const [goalAssist, setGoalAssist] = useState("");
  const [goalMinuteManual, setGoalMinuteManual] = useState("");
  const [matchStarted, setMatchStarted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [halfTime, setHalfTime] = useState(false);
  const [secondHalf, setSecondHalf] = useState(false);
  const [nomPlayerId, setNomPlayerId] = useState("");
  const [nomTrophee, setNomTrophee] = useState("marcel_dor");
  const [nomCommentaire, setNomCommentaire] = useState("");

  useEffect(() => {
    if (!matchStarted) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [matchStarted]);

  const getPlayerName = (id: number) => players.find((p: any) => p.id === id)?.nom || `ID ${id}`;

  const addGoal = async () => {
    if (!goalScorer) {
      alert("Veuillez choisir un buteur.");
      return;
    }
    const minuteToSave = goalMinuteManual !== "" ? Number(goalMinuteManual) : Math.floor(secondsElapsed / 60);

    await supabase.from("evenements_match").insert([
      {
        match_id: match.id,
        minute: minuteToSave,
        equipe: "nubar",
        buteur_id: Number(goalScorer),
        passeur_id: goalAssist ? Number(goalAssist) : null,
      },
    ]);

    setGoalScorer("");
    setGoalAssist("");
    setGoalMinuteManual("");
    onReload();
  };

  const addOpponentGoal = async () => {
    const minuteToSave = goalMinuteManual !== "" ? Number(goalMinuteManual) : Math.floor(secondsElapsed / 60);
    await supabase.from("evenements_match").insert([
      {
        match_id: match.id,
        minute: minuteToSave,
        equipe: "adverse",
      },
    ]);
    setGoalMinuteManual("");
    onReload();
  };

  const deleteEvent = async (eventId: number) => {
    if (!window.confirm("Supprimer ce but ?")) return;
    await supabase.from("evenements_match").delete().eq("id", eventId);
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

    setMatchStarted(false);
    onReload();
  };

    const addNomination = async () => {
    if (!nomPlayerId) {
      alert("Veuillez choisir un joueur à nominer.");
      return;
    }
    const { error } = await supabase.from("nominations").insert([
      {
        trophee: nomTrophee,
        annee: new Date(match.date_match).getFullYear(),
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

  const isFinished = match.statut === "termine";
  const card = { backgroundColor: "#FFF", padding: "20px", borderRadius: "16px", border: "1px solid #E5E7EB", marginBottom: "20px" };

  return (
    <div style={card}>
      <h2 style={{ color: "#1009E6", marginTop: 0, textAlign: "center" }}>⏱️ Direct du match</h2>

      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <div style={{ fontWeight: "bold", color: "#555" }}>
          {secondHalf ? "🔵 2ème période" : "🟢 1ère période"}
        </div>
        <div style={{ fontSize: "32px", fontWeight: "bold", margin: "8px 0" }}>
          {Math.floor(secondsElapsed / 60).toString().padStart(2, "0")}:
          {(secondsElapsed % 60).toString().padStart(2, "0")}
        </div>
        {halfTime && <div style={{ color: "#f57c00", fontWeight: "bold" }}>🟡 MI-TEMPS</div>}
      </div>

      {isAdmin && !isFinished && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {halfTime && (
            <button
              onClick={() => {
                setHalfTime(false);
                setSecondHalf(true);
                setSecondsElapsed(25 * 60);
                setMatchStarted(true);
              }}
              style={{ padding: "10px 16px", borderRadius: "8px", marginBottom: "10px" }}
            >
              ▶️ Reprendre la 2ème période
            </button>
          )}

          <div>
            {!matchStarted ? (
              <button
                onClick={() => {
                  setHalfTime(false);
                  setMatchStarted(true);
                }}
                style={{ padding: "10px 16px", borderRadius: "8px" }}
              >
                ▶️ Démarrer le chrono
              </button>
            ) : (
              <>
                <button onClick={() => setMatchStarted(false)} style={{ padding: "10px 16px", borderRadius: "8px" }}>
                  ⏸️ Pause
                </button>
                <button
                  style={{ marginLeft: "10px", padding: "10px 16px", borderRadius: "8px" }}
                  onClick={() => {
                    setMatchStarted(false);
                    if (!secondHalf) setHalfTime(true);
                    else finishMatch();
                  }}
                >
                  {secondHalf ? "🏁 Terminer le match" : "🟡 Mi-temps"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isAdmin && (
        <div style={{ backgroundColor: "#F8FAFC", padding: "15px", borderRadius: "12px", marginBottom: "20px" }}>
          <h4 style={{ marginTop: 0 }}>⚽ Ajouter un but</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <select value={goalScorer} onChange={(e) => setGoalScorer(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }}>
              <option value="">Choisir le buteur US Nubar</option>
              {players.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>

            <select value={goalAssist} onChange={(e) => setGoalAssist(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }}>
              <option value="">Pas de passeur</option>
              {players.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Minute (laisser vide = chrono actuel)"
              value={goalMinuteManual}
              onChange={(e) => setGoalMinuteManual(e.target.value)}
              style={{ padding: "8px", borderRadius: "8px", border: "1px solid #CCC" }}
            />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={addGoal}
                style={{ backgroundColor: "#1009E6", color: "#FFF", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold" }}
              >
                ⚽ But US Nubar
              </button>
              <button onClick={addOpponentGoal} style={{ padding: "10px 16px", borderRadius: "8px" }}>
                ⚽ But {match.adversaire}
              </button>
            </div>
          </div>
        </div>
      )}

      <h3>📜 Fil du match</h3>
      {events.length === 0 ? (
        <p style={{ color: "#666" }}>Aucun but enregistré pour le moment.</p>
      ) : (
        events.map((event: any) => (
          <div
            key={event.id}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #EEE" }}
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
                style={{ background: "none", border: "none", color: "#d32f2f", cursor: "pointer", fontWeight: "bold" }}
              >
                ❌
              </button>
            )}
          </div>
        ))
      )}
            {isAdmin && (
        <div style={{ backgroundColor: "#F0F4FF", padding: "15px", borderRadius: "12px", marginTop: "20px" }}>
          <h4 style={{ marginTop: 0, color: "#1009E6" }}>⭐ Nominer en direct (Marcel d'Or / Puskas)</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <select value={nomTrophee} onChange={(e) => setNomTrophee(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }}>
              <option value="marcel_dor">🏆 Marcel d'Or</option>
              <option value="puskas">⚽ Prix Puskas</option>
            </select>
            <select value={nomPlayerId} onChange={(e) => setNomPlayerId(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }}>
              <option value="">Choisir le joueur</option>
              {players.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Justification (ex : Raté incroyable, lucarne...)"
              value={nomCommentaire}
              onChange={(e) => setNomCommentaire(e.target.value)}
              style={{ padding: "8px", borderRadius: "8px", border: "1px solid #CCC" }}
            />
            <button
              onClick={addNomination}
              style={{ backgroundColor: "#1009E6", color: "#FFF", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "bold" }}
            >
              Ajouter la nomination
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchLive;
