import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface CommentairesMatchProps {
  matchId: number | string;
  players: any[];
  currentPlayer: any;
  isAdmin: boolean;
}

export default function CommentairesMatch({
  matchId,
  players,
  currentPlayer,
  isAdmin,
}: CommentairesMatchProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("commentaires_match")
      .select("*")
      .eq("match_id", Number(matchId))
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data);
    }
  };

  useEffect(() => {
    loadComments();
  }, [matchId]);

  const getPlayerName = (id: number) =>
    players.find((p: any) => p.id === id)?.nom || `Joueur #${id}`;

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    const date = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    const heure = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return `${date} à ${heure}`;
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlayer || !newComment.trim() || sending) return;

    setSending(true);
    const { error } = await supabase.from("commentaires_match").insert([
      {
        match_id: Number(matchId),
        joueur_id: currentPlayer.id,
        contenu: newComment.trim(),
      },
    ]);

    setSending(false);
    if (error) {
      alert("Erreur lors de l'envoi : " + error.message);
      return;
    }

    setNewComment("");
    loadComments();
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    await supabase.from("commentaires_match").delete().eq("id", commentId);
    loadComments();
  };

  const card = {
    backgroundColor: "#FFF",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    marginBottom: "20px",
  };

  return (
    <div style={card}>
      <h2 style={{ color: "#1009E6", marginTop: 0 }}>
        💬 Fil de commentaires ({comments.length})
      </h2>

      {comments.length === 0 ? (
        <p style={{ color: "#666", fontSize: "14px" }}>
          Aucun commentaire pour le moment. Lance la discussion !
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
          {comments.map((c) => (
            <div
              key={c.id}
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                  fontSize: "12px",
                  color: "#64748B",
                }}
              >
                <span>
                  <strong style={{ color: "#1009E6", fontSize: "13px" }}>
                    {getPlayerName(c.joueur_id)}
                  </strong>{" "}
                  • {formatDateTime(c.created_at)}
                </span>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    title="Supprimer ce commentaire"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#DC2626",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>

              <div style={{ fontSize: "14px", color: "#1E293B", whiteSpace: "pre-wrap" }}>
                {c.contenu}
              </div>
            </div>
          ))}
        </div>
      )}

      {currentPlayer ? (
        <form onSubmit={handleAddComment} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Écrire un commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            disabled={sending || !newComment.trim()}
            style={{
              backgroundColor: "#1009E6",
              color: "#FFF",
              border: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Envoyer
          </button>
        </form>
      ) : (
        <p style={{ color: "#666", fontSize: "13px", marginBottom: 0 }}>
          Connecte-toi pour participer au fil du match.
        </p>
      )}
    </div>
  );
}
