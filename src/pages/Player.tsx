import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Player() {
  const { id } = useParams();

  const [player, setPlayer] = useState<any>(null);

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
    };

    loadPlayer();
  }, [id]);

  if (!player) {
    return <div>Chargement...</div>;
  }

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
      backgroundColor: "#0B4F7D",
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
      color: "#0B4F7D",
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

<h2 style={{ color: "#0B4F7D" }}>
  📊 Statistiques
</h2>
<p>🏆 Buts : {player.buts}</p>

      <p>🎯 Passes : {player.passes}</p>

      <p>✅ Matchs joués : {player.matchs_joues}</p>


<hr />

<h2 style={{ color: "#0B4F7D" }}>
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