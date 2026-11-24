import { useState } from "react";
import { supabase } from "../lib/supabase";
import CompositionTerrain from "../components/CompositionTerrain";

function MatchAvant({ matchId, players, availability, composition, currentPlayer, isAdmin, onReload }: any) {
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("present");

  const getPlayerName = (id: number) => players.find((p: any) => p.id === id)?.nom || `ID ${id}`;

    const regularPlayers = players.filter((p: any) => !p.nom.toLowerCase().startsWith("renfort"));
  const presents = availability.filter((i: any) => i.statut === "present");
  const incertains = availability.filter((i: any) => i.statut === "incertain");
  const absents = availability.filter((i: any) => i.statut === "absent");
  const sansReponse = regularPlayers.filter((p: any) => !availability.some((i: any) => i.joueur_id === p.id));


  const saveAvailability = async (targetId: number, status: string) => {
    if (!targetId) return;
    const existing = availability.find((i: any) => i.joueur_id === targetId);
    if (existing) {
      await supabase.from("disponibilites").update({ statut: status }).eq("id", existing.id);
    } else {
      await supabase.from("disponibilites").insert([{ match_id: Number(matchId), joueur_id: targetId, statut: status }]);
    }
    onReload();
  };

  const card = { backgroundColor: "#FFF", padding: "20px", borderRadius: "16px", border: "1px solid #E5E7EB", marginBottom: "20px" };

  return (
    <div>
      <div style={card}>
        <h2 style={{ color: "#1009E6", marginTop: 0 }}>👥 Disponibilités</h2>

        {isAdmin && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "15px" }}>
            <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }}>
              <option value="">Choisir un joueur</option>
              {regularPlayers.map((p: any) => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }}>
              <option value="present">✅ Présent</option>
              <option value="incertain">❓ Incertain</option>
              <option value="absent">❌ Absent</option>
            </select>
            <button onClick={() => saveAvailability(Number(selectedPlayer), selectedStatus)} style={{ backgroundColor: "#1009E6", color: "#FFF", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold" }}>
              Valider
            </button>
          </div>
        )}

        {!isAdmin && currentPlayer && (
          <div style={{ marginBottom: "15px" }}>
            <p style={{ marginBottom: "8px" }}><strong>Ma réponse ({currentPlayer.nom}) :</strong></p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => saveAvailability(currentPlayer.id, "present")} style={{ padding: "8px 12px", borderRadius: "8px" }}>✅ Présent</button>
              <button onClick={() => saveAvailability(currentPlayer.id, "incertain")} style={{ padding: "8px 12px", borderRadius: "8px" }}>❓ Incertain</button>
              <button onClick={() => saveAvailability(currentPlayer.id, "absent")} style={{ padding: "8px 12px", borderRadius: "8px" }}>❌ Absent</button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div>
            <h4>✅ Présents ({presents.length})</h4>
            {presents.map((i: any) => <div key={i.id}>{getPlayerName(i.joueur_id)}</div>)}
          </div>
          <div>
            <h4>❓ Incertains ({incertains.length})</h4>
            {incertains.map((i: any) => <div key={i.id}>{getPlayerName(i.joueur_id)}</div>)}
            <h4 style={{ marginTop: "10px" }}>❌ Absents ({absents.length})</h4>
            {absents.map((i: any) => <div key={i.id}>{getPlayerName(i.joueur_id)}</div>)}
          </div>
        </div>

        {sansReponse.length > 0 && (
          <p style={{ marginTop: "15px", fontSize: "14px", color: "#666" }}>
            ⏳ <strong>Sans réponse ({sansReponse.length}) :</strong> {sansReponse.map((p: any) => p.nom).join(", ")}
          </p>
        )}
      </div>

      <CompositionTerrain
        matchId={matchId}
        players={players}
        availability={availability}
        composition={composition}
        isAdmin={isAdmin}
        onReload={onReload}
      />
    </div>
  );
}

export default MatchAvant;
