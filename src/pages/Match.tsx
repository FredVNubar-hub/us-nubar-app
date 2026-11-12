import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getCurrentPlayer } from "../lib/currentPlayer";

function Match() {
  const { id } = useParams();

  const [match, setMatch] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("present");
  const [goalScorer, setGoalScorer] = useState("");
  const [goalAssist, setGoalAssist] = useState("");

  const [matchStarted, setMatchStarted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [halfTime, setHalfTime] = useState(false);
  const [secondHalf, setSecondHalf] = useState(false);
  const [matchFinished, setMatchFinished] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [composition, setComposition] = useState<any[]>([]);

  const [selectedFormation, setSelectedFormation] = useState("3-2-1");
  const [selectedPosition, setSelectedPosition] = useState("gardien");
  const [selectedCompositionPlayer, setSelectedCompositionPlayer] = useState("");

  // États pour les nominations
  const [nominationTrophy, setNominationTrophy] = useState("marcel_dor");
  const [nominationPlayer, setNominationPlayer] = useState("");
  const [nominationComment, setNominationComment] = useState("");
  const [matchNominations, setMatchNominations] = useState<any[]>([]);

  useEffect(() => {
    const loadMatch = async () => {
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
      if (data.statut === "termine") {
        setMatchFinished(true);
      }

      const player = await getCurrentPlayer();
      setCurrentPlayer(player);

      const { data: availabilityData } = await supabase
        .from("disponibilites")
        .select("*")
        .eq("match_id", Number(id));

      setAvailability(availabilityData || []);

      const { data: playersData } = await supabase
        .from("joueurs")
        .select("*");

      setPlayers(playersData || []);

      const { data: eventsData } = await supabase
        .from("evenements_match")
        .select("*")
        .eq("match_id", Number(id))
        .order("minute", { ascending: true });

      setEvents(eventsData || []);

      const { data: compositionData } = await supabase
        .from("composition_match")
        .select("*")
        .eq("match_id", Number(id));

      setComposition(compositionData || []);

      const { data: nominationsData } = await supabase
        .from("nominations")
        .select("*")
        .eq("match_id", Number(id));

      setMatchNominations(nominationsData || []);
    };

    loadMatch();
  }, [id]);

  useEffect(() => {
    if (!matchStarted) return;

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [matchStarted]);

  if (!match) {
    return <p>Chargement...</p>;
  }

  const isAdmin = currentPlayer?.role === "admin";

  const getPlayerName = (playerId: number) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.nom : `ID ${playerId}`;
  };

  const presents = availability.filter((item) => item.statut === "present");
  const incertains = availability.filter((item) => item.statut === "incertain");
  const absents = availability.filter((item) => item.statut === "absent");
  const sansReponse = players.filter(
    (player) => !availability.some((item) => item.joueur_id === player.id)
  );

  const saveAvailability = async (targetPlayerId: number, status: string) => {
    if (!targetPlayerId) return;

    const existing = availability.find(
      (item) => item.joueur_id === targetPlayerId
    );

    if (existing) {
      const { error } = await supabase
        .from("disponibilites")
        .update({ statut: status })
        .eq("id", existing.id);

      if (error) {
        console.error(error);
        return;
      }
    } else {
      const { error } = await supabase
        .from("disponibilites")
        .insert([
          {
            match_id: Number(id),
            joueur_id: targetPlayerId,
            statut: status,
          },
        ]);

      if (error) {
        console.error(error);
        return;
      }
    }

    window.location.reload();
  };

  const addGoal = async () => {
    if (!goalScorer) {
      alert("Veuillez choisir un buteur.");
      return;
    }

    const { error } = await supabase
      .from("evenements_match")
      .insert([
        {
          match_id: Number(id),
          minute: Math.floor(secondsElapsed / 60),
          equipe: "nubar",
          buteur_id: Number(goalScorer),
          passeur_id: goalAssist ? Number(goalAssist) : null,
        },
      ]);

    if (error) {
      console.error(error);
      return;
    }

    window.location.reload();
  };

  const addOpponentGoal = async () => {
    const { error } = await supabase
      .from("evenements_match")
      .insert([
        {
          match_id: Number(id),
          minute: Math.floor(secondsElapsed / 60),
          equipe: "adverse",
        },
      ]);

    if (error) {
      console.error(error);
      return;
    }

    window.location.reload();
  };

  const deleteEvent = async (eventId: number) => {
    if (!window.confirm("Supprimer ce but de l'historique ?")) return;

    const { error } = await supabase
      .from("evenements_match")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error(error);
      alert("Erreur lors de la suppression.");
      return;
    }

    window.location.reload();
  };

  const addComposition = async () => {
    if (!selectedCompositionPlayer) return;

    const existing = composition.find(
      (item) => item.joueur_id === Number(selectedCompositionPlayer)
    );

    if (existing) {
      const { error } = await supabase
        .from("composition_match")
        .update({
          formation: selectedFormation,
          position: selectedPosition,
        })
        .eq("id", existing.id);

      if (error) {
        console.error(error);
        return;
      }

      window.location.reload();
      return;
    }

    const { error } = await supabase
      .from("composition_match")
      .insert([
        {
          match_id: Number(id),
          joueur_id: Number(selectedCompositionPlayer),
          formation: selectedFormation,
          position: selectedPosition,
        },
      ]);

    if (error) {
      console.error(error);
      return;
    }

    window.location.reload();
  };

  const addNomination = async () => {
    if (!nominationPlayer) {
      alert("Veuillez choisir un joueur à nominer.");
      return;
    }

    const matchYear = match.date_match
      ? new Date(match.date_match).getFullYear()
      : new Date().getFullYear();

    const { error } = await supabase.from("nominations").insert([
      {
        trophee: nominationTrophy,
        annee: matchYear,
        joueur_id: Number(nominationPlayer),
        match_id: Number(id),
        commentaire: nominationComment,
        vote_ouvert: false,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Erreur lors de l'ajout de la nomination.");
      return;
    }

    alert("Nomination enregistrée !");
    window.location.reload();
  };

  const deleteNomination = async (nominationId: number) => {
    if (!window.confirm("Supprimer cette nomination ?")) return;

    const { error } = await supabase
      .from("nominations")
      .delete()
      .eq("id", nominationId);

    if (error) {
      console.error(error);
      return;
    }

    window.location.reload();
  };

  const gardiens = composition.filter((item) => item.position === "gardien");
  const defenseurs = composition.filter((item) => item.position === "defenseur");
  const milieux = composition.filter((item) => item.position === "milieu");
  const attaquants = composition.filter((item) => item.position === "attaquant");
  const remplacants = composition.filter((item) => item.position === "remplacant");

  const gardien = gardiens[0];
  const attaquant = attaquants[0];

  const joueursComposition = composition.map((item) => ({
    id: item.joueur_id,
    nom: getPlayerName(item.joueur_id),
  }));

  const butsNubar = events.filter((event) => event.equipe === "nubar").length;
  const butsAdverses = events.filter((event) => event.equipe === "adverse").length;
  const adversaire = match?.adversaire || "";

  return (
    <div>
      <h1 style={{ color: "#1009E6" }}>
        ⚽ US NUBAR - {match.adversaire}
      </h1>

      <p>📅 {new Date(match.date_match).toLocaleDateString("fr-FR")}</p>
      <p>📍 {match.lieu}</p>

      {/* SECTION DISPONIBILITÉS */}
      <h2 style={{ color: "#1009E6" }}>👥 Disponibilités</h2>

      {isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            <option value="">Choisir un joueur</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.nom}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ marginLeft: "10px" }}
          >
            <option value="present">✅ Présent</option>
            <option value="incertain">❓ Incertain</option>
            <option value="absent">❌ Absent</option>
          </select>

          <button
            onClick={() => saveAvailability(Number(selectedPlayer), selectedStatus)}
            style={{ marginLeft: "10px" }}
          >
            Ajouter
          </button>
        </div>
      )}

      {!isAdmin && currentPlayer && (
        <div style={{ marginBottom: "20px" }}>
          <p><strong>Ma disponibilité ({currentPlayer.nom}) :</strong></p>
          <button onClick={() => saveAvailability(currentPlayer.id, "present")}>
            ✅ Présent
          </button>
          <button
            onClick={() => saveAvailability(currentPlayer.id, "incertain")}
            style={{ marginLeft: "10px" }}
          >
            ❓ Incertain
          </button>
          <button
            onClick={() => saveAvailability(currentPlayer.id, "absent")}
            style={{ marginLeft: "10px" }}
          >
            ❌ Absent
          </button>
        </div>
      )}

      <h3>✅ Présents ({presents.length})</h3>
      {presents.map((item) => (
        <p key={item.id}>{getPlayerName(item.joueur_id)}</p>
      ))}

      <h3>❓ Incertains ({incertains.length})</h3>
      {incertains.map((item) => (
        <p key={item.id}>{getPlayerName(item.joueur_id)}</p>
      ))}

      <h3>❌ Absents ({absents.length})</h3>
      {absents.map((item) => (
        <p key={item.id}>{getPlayerName(item.joueur_id)}</p>
      ))}

      <h3>⏳ Sans réponse ({sansReponse.length})</h3>
      {sansReponse.map((player) => (
        <p key={player.id}>{player.nom}</p>
      ))}

      {/* SECTION COMPOSITION */}
      <h2 style={{ color: "#1009E6", marginTop: "40px" }}>🟢 Composition</h2>

      {isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
          >
            <option value="gardien">🥅 Gardien</option>
            <option value="defenseur">🛡️ Défenseur</option>
            <option value="milieu">🎯 Milieu</option>
            <option value="attaquant">⚽ Attaquant</option>
            <option value="remplacant">🟡 Remplaçant</option>
          </select>

          <br />
          <br />

          <select
            value={selectedCompositionPlayer}
            onChange={(e) => setSelectedCompositionPlayer(e.target.value)}
          >
            <option value="">Choisir un joueur</option>
            {presents.map((item) => (
              <option key={item.joueur_id} value={item.joueur_id}>
                {getPlayerName(item.joueur_id)}
              </option>
            ))}
          </select>

          <br />
          <br />

          <button onClick={addComposition}>Ajouter à la composition</button>
        </div>
      )}

      <h3>🥅 Gardien</h3>
      {gardiens.map((item) => (
        <p key={item.id}>{getPlayerName(item.joueur_id)}</p>
      ))}

      <h3>🛡️ Défenseurs</h3>
      {defenseurs.map((item) => (
        <p key={item.id}>{getPlayerName(item.joueur_id)}</p>
      ))}

      <h3>🎯 Milieux</h3>
      {milieux.map((item) => (
        <p key={item.id}>{getPlayerName(item.joueur_id)}</p>
      ))}

      <h3>⚽ Attaquants</h3>
      {attaquants.map((item) => (
        <p key={item.id}>{getPlayerName(item.joueur_id)}</p>
      ))}

      <h3>🟡 Remplaçants</h3>
      {remplacants.map((item) => (
        <p key={item.id}>{getPlayerName(item.joueur_id)}</p>
      ))}

      {/* SECTION TERRAIN */}
      <h2 style={{ color: "#1009E6", marginTop: "40px" }}>🏟️ Terrain</h2>

      <div
        style={{
          border: "2px solid green",
          padding: "20px",
          marginTop: "20px",
          marginBottom: "20px",
          textAlign: "center",
          backgroundColor: "#e8f5e9",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          ⚽ {attaquant ? getPlayerName(attaquant.joueur_id) : ""}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "30px",
          }}
        >
          {milieux.map((item) => (
            <div key={item.id}>🎯 {getPlayerName(item.joueur_id)}</div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "30px",
          }}
        >
          {defenseurs.map((item) => (
            <div key={item.id}>🛡️ {getPlayerName(item.joueur_id)}</div>
          ))}
        </div>

        <div>🥅 {gardien ? getPlayerName(gardien.joueur_id) : ""}</div>
      </div>

      <p>
        Utilisateur : {currentPlayer?.nom || "Non connecté"} - Admin :{" "}
        {isAdmin ? "Oui" : "Non"}
      </p>

      {/* SECTION LIVE MATCH */}
      <h2 style={{ color: "#1009E6", marginTop: "40px" }}>⚽ Live Match</h2>

      <div style={{ textAlign: "center" }}>
        <h3>{secondHalf ? "🔵 2ème période" : "🟢 1ère période"}</h3>
      </div>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h3>
          ⏱️{" "}
          {Math.floor(secondsElapsed / 60)
            .toString()
            .padStart(2, "0")}
          :
          {(secondsElapsed % 60)
            .toString()
            .padStart(2, "0")}
        </h3>
      </div>

      {halfTime && (
        <h3 style={{ textAlign: "center", color: "#f57c00" }}>🟡 MI-TEMPS</h3>
      )}

      {matchFinished && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h3 style={{ color: "#d32f2f" }}>⏹️ MATCH TERMINÉ</h3>
          {isAdmin && (
            <button
              onClick={() => {
                setMatchFinished(false);
                setMatchStarted(false);
              }}
            >
              🔄 Rouvrir le match (Admin)
            </button>
          )}
        </div>
      )}

      {isAdmin && halfTime && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={() => {
              setHalfTime(false);
              setSecondHalf(true);
              setSecondsElapsed(25 * 60);
              setMatchStarted(true);
            }}
          >
            ▶️ Reprendre la 2ème période
          </button>
        </div>
      )}

      {isAdmin && !matchFinished && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {!matchStarted ? (
            <button
              onClick={() => {
                setHalfTime(false);
                setMatchStarted(true);
              }}
            >
              ▶️ Démarrer
            </button>
          ) : (
            <>
              <button onClick={() => setMatchStarted(false)}>⏸️ Pause</button>

              <button
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  if (!secondHalf) {
                    setMatchStarted(false);
                    setHalfTime(true);
                  } else {
                    setMatchStarted(false);
                    setMatchFinished(true);
                  }
                }}
              >
                {secondHalf ? "⏹️ Fin du match" : "🟡 Mi-temps"}
              </button>
            </>
          )}
        </div>
      )}

      <h3
        style={{
          color: "#1009E6",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        US NUBAR {butsNubar} - {butsAdverses} {adversaire}
      </h3>

      {isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <select
            value={goalScorer}
            onChange={(e) => setGoalScorer(e.target.value)}
          >
            <option value="">Choisir le buteur</option>
            {joueursComposition.map((player) => (
              <option key={player.id} value={player.id}>
                {player.nom}
              </option>
            ))}
          </select>

          <br />
          <br />

          <select
            value={goalAssist}
            onChange={(e) => setGoalAssist(e.target.value)}
          >
            <option value="">Pas de passeur</option>
            {joueursComposition.map((player) => (
              <option key={player.id} value={player.id}>
                {player.nom}
              </option>
            ))}
          </select>

          <br />
          <br />

          <button onClick={addGoal}>⚽ But US Nubar</button>

          <button onClick={addOpponentGoal} style={{ marginLeft: "10px" }}>
            ⚽ But adverse
          </button>
        </div>
      )}

      {/* HISTORIQUE DU MATCH */}
      <h3 style={{ marginTop: "30px" }}>📜 Historique du match</h3>

      {events.map((event) => (
        <p key={event.id}>
          {event.equipe === "adverse" ? (
            <>⚽ {event.minute}' But {adversaire}</>
          ) : (
            <>
              ⚽ {event.minute}' {getPlayerName(event.buteur_id)}
              {event.passeur_id && ` (${getPlayerName(event.passeur_id)})`}
            </>
          )}
          {isAdmin && (
            <button
              onClick={() => deleteEvent(event.id)}
              style={{
                marginLeft: "10px",
                backgroundColor: "#ffebee",
                color: "#c62828",
                border: "1px solid #ef9a9a",
                borderRadius: "6px",
                cursor: "pointer",
                padding: "2px 6px",
              }}
              title="Supprimer ce but"
            >
              ❌
            </button>
          )}
        </p>
      ))}

      {/* SECTION NOMINATIONS POUR LES TROPHÉES (ADMIN) */}
      {isAdmin && (
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            backgroundColor: "#FFFBEB",
            border: "2px solid #F59E0B",
            borderRadius: "12px",
          }}
        >
          <h2 style={{ color: "#B45309", marginTop: 0 }}>
            ⭐ Nominer pour les trophées de fin d'année
          </h2>

          <div style={{ marginBottom: "10px" }}>
            <select
              value={nominationTrophy}
              onChange={(e) => setNominationTrophy(e.target.value)}
            >
              <option value="marcel_dor">🏆 Marcel d'Or</option>
              <option value="puskas">⚽ Prix Puskas</option>
            </select>

            <select
              value={nominationPlayer}
              onChange={(e) => setNominationPlayer(e.target.value)}
              style={{ marginLeft: "10px" }}
            >
              <option value="">Choisir un joueur</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.nom}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Raison / description (ex: Lucarne à la 42e)"
              value={nominationComment}
              onChange={(e) => setNominationComment(e.target.value)}
              style={{ width: "100%", maxWidth: "400px", padding: "6px" }}
            />
          </div>

          <button onClick={addNomination}>
            ➕ Enregistrer la nomination
          </button>

          {matchNominations.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <h4>Nominations sur ce match :</h4>
              {matchNominations.map((nom) => (
                <p key={nom.id}>
                  {nom.trophee === "marcel_dor" ? "🏆 Marcel d'Or" : "⚽ Puskas"} :{" "}
                  <strong>{getPlayerName(nom.joueur_id)}</strong>
                  {nom.commentaire && ` — "${nom.commentaire}"`}
                  <button
                    onClick={() => deleteNomination(nom.id)}
                    style={{ marginLeft: "10px", cursor: "pointer" }}
                  >
                    ❌
                  </button>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Match;
