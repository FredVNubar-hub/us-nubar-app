import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const SLOTS_BY_FORMATION: Record<string, { defense: { id: string; label: string }[]; milieu: { id: string; label: string }[] }> = {
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
  "3-3-1": {
    defense: [
      { id: "defenseur_gauche", label: "🛡️ Défenseur Gauche" },
      { id: "defenseur_centre", label: "🛡️ Défenseur Central" },
      { id: "defenseur_droit", label: "🛡️ Défenseur Droit" },
    ],
    milieu: [
      { id: "milieu_gauche", label: "🎯 Milieu Gauche" },
      { id: "milieu_centre", label: "🎯 Milieu Central" },
      { id: "milieu_droit", label: "🎯 Milieu Droit" },
    ],
  },
};

export default function CompositionTerrain({ matchId, players, availability, composition, isAdmin, isLive = false, onReload }: any) {
  const [formation, setFormation] = useState("3-2-1");
  const [selectedPosition, setSelectedPosition] = useState("gardien");
  const [selectedCompPlayer, setSelectedCompPlayer] = useState("");
  const [playerOutId, setPlayerOutId] = useState("");
  const [playerInId, setPlayerInId] = useState("");

  useEffect(() => {
    const saved = composition.find((i: any) => i.formation && SLOTS_BY_FORMATION[i.formation]);
    if (saved) setFormation(saved.formation);
  }, [composition]);

  const getPlayerName = (id: number) => players.find((p: any) => p.id === id)?.nom || `ID ${id}`;
  const presents = availability.filter((i: any) => i.statut === "present");
  const titulaires = composition.filter((i: any) => i.position !== "remplacant");
  const remplacants = composition.filter((i: any) => i.position === "remplacant");

  const currentSlots = SLOTS_BY_FORMATION[formation] || SLOTS_BY_FORMATION["3-2-1"];
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

  const handleSubstitution = async () => {
    if (!playerOutId || !playerInId) return alert("Choisis le joueur qui sort et le joueur qui entre.");
    const outComp = composition.find((i: any) => i.id === Number(playerOutId));
    const inComp = composition.find((i: any) => i.id === Number(playerInId));
    if (!outComp || !inComp) return;

    await supabase.from("composition_match").update({ position: "remplacant" }).eq("id", outComp.id);
    await supabase.from("composition_match").update({ position: outComp.position, formation }).eq("id", inComp.id);
    setPlayerOutId("");
    setPlayerInId("");
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
          padding: "6px 8px",
          minWidth: "80px",
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
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
        <h2 style={{ color: "#1009E6", margin: 0 }}>🟢 Composition ({formation})</h2>
        {isAdmin && (
          <select value={formation} onChange={(e) => changeFormation(e.target.value)} style={{ padding: "8px", borderRadius: "8px", fontWeight: "bold", border: "2px solid #1009E6", color: "#1009E6" }}>
            <option value="3-2-1">Système 3-2-1 (7)</option>
            <option value="2-3-1">Système 2-3-1 (7)</option>
            <option value="3-3-1">Système 3-3-1 (8)</option>
          </select>
        )}
      </div>

      {isAdmin && isLive && titulaires.length > 0 && remplacants.length > 0 && (
        <div style={{ backgroundColor: "#FFF8E1", border: "1px solid #FFE082", padding: "12px", borderRadius: "12px", marginBottom: "15px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#B26A00" }}>🔄 Effectuer un changement</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <select value={playerOutId} onChange={(e) => setPlayerOutId(e.target.value)} style={{ padding: "8px", borderRadius: "8px", flex: 1 }}>
              <option value="">🔴 Sortant (terrain)</option>
              {titulaires.map((t: any) => (
                <option key={t.id} value={t.id}>{getPlayerName(t.joueur_id)}</option>
              ))}
            </select>
            <select value={playerInId} onChange={(e) => setPlayerInId(e.target.value)} style={{ padding: "8px", borderRadius: "8px", flex: 1 }}>
              <option value="">🟢 Entrant (banc)</option>
              {remplacants.map((r: any) => (
                <option key={r.id} value={r.id}>{getPlayerName(r.joueur_id)}</option>
              ))}
            </select>
            <button onClick={handleSubstitution} style={{ backgroundColor: "#1009E6", color: "#FFF", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
              Valider
            </button>
          </div>
        </div>
      )}

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
            <option value="">Choisir un joueur</option>
            {presents.map((i: any) => (
              <option key={i.joueur_id} value={i.joueur_id}>{getPlayerName(i.joueur_id)}</option>
            ))}
            {players
              .filter((p: any) => p.nom.toLowerCase().startsWith("renfort"))
              .map((r: any) => (
                <option key={r.id} value={r.id}>🆕 {r.nom}</option>
              ))}
          </select>

          <button onClick={addComposition} style={{ backgroundColor: "#1009E6", color: "#FFF", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            Placer
          </button>
        </div>
      )}

      <div style={{ border: "2px solid #2e7d32", borderRadius: "12px", padding: "18px 8px", textAlign: "center", backgroundColor: "#e8f5e9", marginBottom: "15px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "22px" }}>
          {renderSlotBox("attaquant", "⚽ Attaquant")}
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", gap: "6px", marginBottom: "22px" }}>
          {currentSlots.milieu.map((slot) => renderSlotBox(slot.id, slot.label.replace("🎯 ", "")))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", gap: "6px", marginBottom: "22px" }}>
          {currentSlots.defense.map((slot) => renderSlotBox(slot.id, slot.label.replace("🛡️ ", "")))}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {renderSlotBox("gardien", "🥅 Gardien")}
        </div>
      </div>

      <div>
        <strong>🟡 Remplaçants : </strong>
        {remplacants.length === 0 ? (
          <span style={{ color: "#888", fontStyle: "italic" }}>Aucun</span>
        ) : (
          remplacants.map((item: any) => (
            <span key={item.id} style={{ display: "inline-block", backgroundColor: "#F3F4F6", padding: "4px 8px", borderRadius: "6px", marginRight: "8px", marginTop: "4px", fontSize: "14px" }}>
              {getPlayerName(item.joueur_id)}
              {isAdmin && (
                <button onClick={() => removeComp(item.id)} style={{ marginLeft: "5px", color: "red", border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}>
                  ×
                </button>
              )}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
