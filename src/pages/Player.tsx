import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Player() {
  const { id } = useParams();

  const [player, setPlayer] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

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
      const { data: eventsData, error: eventsError } =
      await supabase
      .from("evenements_match")
      .select("*");

      if (eventsError) {
      console.error(eventsError);
      return;
      }

setEvents(eventsData || []);
    };

    loadPlayer();
  }, [id]);

  if (!player) {
    return <div>Chargement...</div>;
  }

  const buts = events.filter(
  (event) =>
    event.equipe === "nubar" &&
    event.buteur_id === player.id
).length;

const passes = events.filter(
  (event) =>
    event.equipe === "nubar" &&
    event.passeur_id === player.id
).length;

  return (
    <div>
      <Link to="/team">
  ← Retour à l'équipe
</Link>

<br />
<br />
      <div
  style={{
    textAlign: "center",
    marginBottom: "25px",
  }}
>
  <div
    style={{
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      backgroundColor: "#1009E6",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "50px",
      margin: "0 auto 15px auto",
    }}
  >
    👤
  </div>

  <h1
    style={{
      color: "#1009E6",
      margin: 0,
    }}
  >
    {player.nom}
  </h1>
</div>

<p>
  🎂 Né le{" "}
  {player.date_naissance
    ? new Date(player.date_naissance).toLocaleDateString(
        "fr-FR",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "Non renseigné"}
</p>

<p>⚽ Poste : {player.poste}</p>

<p>🔢 Numéro : {player.numero}</p>

      <hr />

<h2 style={{ color: "#1009E6" }}>
  📊 Statistiques
</h2>
      <p>🏆 Buts : {buts}</p>

      <p>🎯 Passes : {passes}</p>

      <p>✅ Matchs joués : {player.matchs_joues}</p>


<hr />

<h2 style={{ color: "#1009E6" }}>
  🏅 Récompenses
</h2>
<p>🏅 Homme du Match : {player.hommes_du_match}</p>

<p>⭐ Marcel d'Or : {player.marcel_dor}</p>

<p>⭐ Puskas : {player.puskas}</p>

<p>🏆 Autres récompenses : {player.autres_recompenses}</p>

    </div>
  );
}

export default Player;