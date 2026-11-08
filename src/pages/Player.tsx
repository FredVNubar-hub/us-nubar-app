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
      <h1>👤 {player.nom}</h1>

      <p>⚽ Poste : {player.poste}</p>

      <p>🔢 Numéro : {player.numero}</p>

      <p>🎂 Âge : {player.age} ans</p>

      <p>🏆 Buts : {player.buts}</p>

      <p>🎯 Passes : {player.passes}</p>
    </div>
  );
}

export default Player;