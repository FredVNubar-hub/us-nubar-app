import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface VideosMatchProps {
  matchId: number | string;
  isAdmin: boolean;
}

export default function VideosMatch({ matchId, isAdmin }: VideosMatchProps) {
  const [videos, setVideos] = useState<any[]>([]);
  const [titre, setTitre] = useState("");
  const [urlYoutube, setUrlYoutube] = useState("");
  const [saving, setSaving] = useState(false);

  const loadVideos = async () => {
    const { data, error } = await supabase
      .from("videos_match")
      .select("*")
      .eq("match_id", Number(matchId))
      .order("created_at", { ascending: true });

    if (!error && data) {
      setVideos(data);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [matchId]);

  const extractYoutubeId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.trim().match(regex);
    return match ? match[1] : null;
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlYoutube.trim() || saving) return;

    const videoId = extractYoutubeId(urlYoutube);
    if (!videoId) {
      alert("⚠️ Lien YouTube non reconnu. Colle une URL YouTube valide (watch, live ou youtu.be).");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("videos_match").insert([
      {
        match_id: Number(matchId),
        titre: titre.trim() || null,
        url_youtube: urlYoutube.trim(),
      },
    ]);

    setSaving(false);
    if (error) {
      alert("Erreur lors de l'ajout : " + error.message);
      return;
    }

    setTitre("");
    setUrlYoutube("");
    loadVideos();
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!window.confirm("Supprimer cette vidéo du match ?")) return;
    await supabase.from("videos_match").delete().eq("id", videoId);
    loadVideos();
  };

  // Si aucune vidéo n'est ajoutée et que l'utilisateur n'est pas admin, on n'affiche rien
  if (videos.length === 0 && !isAdmin) {
    return null;
  }

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
        📺 Direct & Vidéos du match {videos.length > 0 ? `(${videos.length})` : ""}
      </h2>

      {isAdmin && (
        <form
          onSubmit={handleAddVideo}
          style={{
            backgroundColor: "#F8FAFC",
            padding: "12px",
            borderRadius: "12px",
            marginBottom: videos.length > 0 ? "18px" : "0",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <input
            type="text"
            placeholder="Titre (optionnel : ex. 1ère mi-temps, Direct...)"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}
          />
          <input
            type="url"
            placeholder="Coller le lien YouTube (://youtube.com..., youtu.be/...)"
            value={urlYoutube}
            onChange={(e) => setUrlYoutube(e.target.value)}
            required
            style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}
          />
          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: "#1009E6",
              color: "#FFF",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {saving ? "Ajout..." : "➕ Ajouter la vidéo"}
          </button>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {videos.map((v) => {
          const ytId = extractYoutubeId(v.url_youtube);
          return (
            <div key={v.id}>
              {(v.titre || isAdmin) && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <strong style={{ color: "#1E293B", fontSize: "15px" }}>
                    {v.titre || "🎥 Vidéo du match"}
                  </strong>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteVideo(v.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#DC2626",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      🗑️ Supprimer
                    </button>
                  )}
                </div>
              )}

              {ytId ? (
                <div
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    overflow: "hidden",
                    borderRadius: "12px",
                    backgroundColor: "#000",
                  }}
                >
                  <iframe
                    src={"https://youtube.com" + ytId}
                    title={v.titre || "Vidéo YouTube US Nubar"}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a href={v.url_youtube} target="_blank" rel="noreferrer" style={{ color: "#1009E6" }}>
                  Voir la vidéo sur YouTube
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
