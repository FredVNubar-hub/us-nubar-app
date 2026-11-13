import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const SLOTS_BY_FORMATION: Record<string, {
  defense: { id: string; label: string }[];
  milieu: { id: string; label: string }[];
}> = {
  "3-2-1": {
    defense: [
      { id: "defenseur_gauche", label: "🛡️ Défenseur Gauche" },
      { id: "defenseur_centre", label: "🛡️ Défenseur Central" },
      { id: "defenseur_droit", label: "🛡️ Défenseur Droit" },
    ],
    milieu: [
      { id: "milieu_gauche", label: "🎯 Milieu Gauche" },
      { id: "milieu_droit", label: "🎯 Milieu Droit" },
    ],
  },
  "2-3-1": {
    defense: [
      { id: "defenseur_gauche", label: "🛡️ Défenseur Gauche" },
      { id: "defenseur_droit", label: "🛡️ Défenseur Droit" },
    ],
    milieu: [
      { id: "milieu_gauche", label: "🎯 Milieu Gauche" },
      { id: "milieu_centre", label: "🎯 Milieu Central" },
      { id: "milieu_droit", label: "🎯 Milieu Droit" },
    ],
  },
};

function MatchAvant({ matchId, players, availability, composition, currentPlayer, isAdmin, onReload }: any) {
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("present");
  const [formation, setFormation] = useState("3-2-1");
  const [selectedPosition, setSelectedPosition] = useState("gardien");
  const [selectedCompPlayer, setSelectedCompPlayer] = useState("");

  useEffect(() => {
    const saved = composition.find((i: any) => i.formation && SLOTS_BY_FORMATION[i.formation]);
    if (saved) setFormation(saved.formation);
  }, [composition]);

  const getPlayerName = (id: number) => players.find((p: any) => p.id === id)?.nom || `ID ${id}`;

  const presents = availability.filter((i: any) => i.statut === "present");
  const incertains = availability.filter((i: any) => i.statut === "incertain");
  const absents = availability.filter((i: any) => i.statut === "absent");
  const sansReponse = players.filter((p: any) => !availability.some((i: any) => i.joueur_id === p.id));

  const currentSlots = SLOTS_BY_FORMATION[formation];
  const allPositionOptions = [
    { id: "gardien", label: "🥅 Gardien" },
    ...currentSlots.defense,
    ...currentSlots.milieu,
    { id: "attaquant", label: "⚽ Attaquant" },
    { id: "remplacant", label: "🟡 Remplaçant" },
  ];

  const isSlotOccupied = (posId: string, ignorePlayerId?: number) => {
    if (posId === "remplacant") return false;
    return composition.some((i: any) => i.position === posId && i.joueur_id !== ignorePlayerId);
  };

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

  const changeFormation = async (newFormation: string) => {
    setFormation(newFormation);
    setSelectedPosition("gardien");
    if (composition.length > 0) {
      await supabase.from("composition_match").update({ formation: newFormation }).eq("match_id", Number(matchId));
      onReload();
    }
  };

  const addComposition = async () => {
    if (!selectedCompPlayer) return;
    const targetPlayerId = Number(selectedCompPlayer);

    if (isSlotOccupied(selectedPosition, targetPlayerId)) {
      alert("⚠️ Ce poste précis est déjà occupé ! Retirez d'abord le joueur en place.");
      return;
    }

    const existing = composition.find((i: any) => i.joueur_id === targetPlayerId);
    if (existing) {
      await supabase.from("composition_match").update({ formation, position: selectedPosition }).eq("id", existing.id);
    } else {
      await supabase.from("composition_match").insert([{ match_id: Number(matchId), joueur_id: targetPlayerId, formation, position: selectedPosition }]);
    }
    setSelectedCompPlayer("");
    onReload();
  };

  const removeComp = async (compId: number) => {
    await supabase.from("composition_match").delete().eq("id", compId);
    onReload();
  };

  const renderSlotBox = (posId: string, shortLabel: string) => {
    const occupant = composition.find((i: any) => i.position === posId);
    return (
      <div
        key={posId}
        style={{
          backgroundColor: occupant ? "#FFFFFF" : "rgba(255,255,255,0.5)",
          border: occupant ? "2px solid #1009E6" : "1px dashed #2e7d32",
          borderRadius: "10px",
          padding: "6px 10px",
          minWidth: "85px",
          fontSize: "13px",
        }}
      >
        <div style={{ fontSize: "11px", color: "#555" }}>{shortLabel}</div>
        {occupant ? (
          <div style={{ fontWeight: "bold", color: "#1009E6", marginTop: "2px" }}>
            {getPlayerName(occupant.joueur_id)}
            {isAdmin && (
              <button
                onClick={() => removeComp(occupant.id)}
                style={{ marginLeft: "5px", border: "none", background: "none", color: "red", cursor: "pointer", fontWeight: "bold" }}
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <div style={{ color: "#888", fontStyle: "italic", marginTop: "2px" }}>Libre</div>
        )}
      </div>
    );
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
              {players.map((p: any) => <option key={p.id} value={p.id}>{p.nom}</option>)}
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

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
          <h2 style={{ color: "#1009E6", margin: 0 }}>🟢 Composition ({formation})</h2>
          {isAdmin && (
            <select value={formation} onChange={(e) => changeFormation(e.target.value)} style={{ padding: "8px", borderRadius: "8px", fontWeight: "bold", border: "2px solid #1009E6", color: "#1009E6" }}>
              <option value="3-2-1">Système 3-2-1</option>
              <option value="2-3-1">Système 2-3-1</option>
            </select>
          )}
        </div>

        {isAdmin && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "15px" }}>
            <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }}>
              {allPositionOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} {isSlotOccupied(opt.id) ? "(Occupé)" : ""}
                </option>
              ))}
            </select>

            <select value={selectedCompPlayer} onChange={(e) => setSelectedCompPlayer(e.target.value)} style={{ padding: "8px", borderRadius: "8px" }}>
              <option value="">Choisir un présent</option>
              {presents.map((i: any) => (
                <option key={i.joueur_id} value={i.joueur_id}>
                  {getPlayerName(i.joueur_id)}
                </option>
              ))}
            </select>

            <button onClick={addComposition} style={{ backgroundColor: "#1009E6", color: "#FFF", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold" }}>
              Placer
            </button>
          </div>
        )}

        <div style={{ border: "2px solid #2e7d32", borderRadius: "12px", padding: "18px 8px", textAlign: "center", backgroundColor: "#e8f5e9", marginBottom: "15px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "22px" }}>
            {renderSlotBox("attaquant", "⚽ Attaquant")}
          </div>

          <div style={{ display: "flex", justifyContent: "space-around", gap: "6px", marginBottom: "22px" }}>
            {currentSlots.milieu.map((slot) =>
              renderSlotBox(slot.id, slot.label.replace("🎯 ", ""))
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-around", gap: "6px", marginBottom: "22px" }}>
            {currentSlots.defense.map((slot) =>
              renderSlotBox(slot.id, slot.label.replace("🛡️ ", ""))
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            {renderSlotBox("gardien", "🥅 Gardien")}
          </div>
        </div>

        <div>
          <strong>🟡 Remplaçants : </strong>
          {composition.filter((i: any) => i.position === "remplacant").map((item: any) => (
            <span key={item.id} style={{ marginRight: "10px" }}>
              {getPlayerName(item.joueur_id)}
              {isAdmin && <button onClick={() => removeComp(item.id)} style={{ marginLeft: "4px", color: "red", border: "none", background: "none" }}>×</button>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MatchAvant;
