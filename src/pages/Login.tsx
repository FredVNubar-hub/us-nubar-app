import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerRole, setPlayerRole] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPlayerInfo = async (userEmail?: string) => {
    if (!userEmail) {
      setPlayerName("");
      setPlayerRole("");
      return;
    }

    const { data: player } = await supabase
      .from("joueurs")
      .select("*")
      .eq("email", userEmail)
      .maybeSingle();

    if (player) {
      setPlayerName(player.nom);
      setPlayerRole(player.role || "joueur");
    } else {
      setPlayerName("");
      setPlayerRole("non associé");
    }
  };

  useEffect(() => {
    const initSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      if (user?.email) {
        await fetchPlayerInfo(user.email);
      }
    };

    initSession();
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Erreur de connexion : " + error.message);
      setLoading(false);
      return;
    }

    setUser(data.user);
    await fetchPlayerInfo(data.user?.email);
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  const signUp = async () => {
    if (!email || !password) {
      alert("Veuillez renseigner un email et un mot de passe.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Erreur : " + error.message);
      setLoading(false);
      return;
    }

    setUser(data.user);
    await fetchPlayerInfo(data.user?.email);
    setEmail("");
    setPassword("");
    setLoading(false);
    alert("✅ Compte créé et connecté !");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPlayerName("");
    setPlayerRole("");
  };

  const cardStyle = {
    backgroundColor: "#FFFFFF",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
    border: "1px solid #E2E8F0",
    maxWidth: "460px",
    margin: "0 auto",
  };

  return (
    <div>
      <h1 style={{ color: "#1009E6", fontSize: "24px", textAlign: "center", marginBottom: "18px" }}>
        🔐 Espace Membre
      </h1>

      {user ? (
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#DCFCE7",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              margin: "0 auto 12px auto",
            }}
          >
            ✅
          </div>

          <h2 style={{ color: "#0F172A", fontSize: "20px", marginBottom: "4px" }}>
            {playerName || user.email}
          </h2>

          <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "14px" }}>
            {user.email}
          </p>

          <div style={{ marginBottom: "20px" }}>
            <span
              style={{
                backgroundColor: playerRole === "admin" ? "#FEF3C7" : "#EEF2FF",
                color: playerRole === "admin" ? "#92400E" : "#1009E6",
                padding: "5px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {playerRole === "admin" ? "👑 Administrateur" : `⚽ Rôle : ${playerRole}`}
            </span>
          </div>

          <button
            onClick={signOut}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #FCA5A5",
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              fontWeight: "bold",
            }}
          >
            🚪 Se déconnecter
          </button>
        </div>
      ) : (
        <form onSubmit={signIn} style={cardStyle}>
          <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "16px", textAlign: "center" }}>
            Connectez-vous avec l'email enregistré dans votre fiche joueur US NUBAR.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px", color: "#334155" }}>
                Adresse email
              </label>
              <input
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px", color: "#334155" }}>
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "6px",
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#1009E6",
                color: "#FFFFFF",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <button
              type="button"
              onClick={signUp}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "10px",
                border: "2px solid #1009E6",
                backgroundColor: "#FFFFFF",
                color: "#1009E6",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Créer un compte
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Login;
