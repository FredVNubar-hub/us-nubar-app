import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [playerName, setPlayerName] = useState("");

useEffect(() => {
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
    if (user?.email) {
  const { data: player } = await supabase
    .from("joueurs")
    .select("*")
    .eq("email", user.email)
    .single();

  if (player) {
    setPlayerName(player.nom);
  }
}
  };

  getUser();
}, []);

  const signUp = async () => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  setUser(user);

  alert("Compte créé !");
};

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const {
  data: { user },
} = await supabase.auth.getUser();

setUser(user);

alert("Connexion réussie !");
  };

const signOut = async () => {
  await supabase.auth.signOut();

  setUser(null);

  alert("Déconnexion réussie !");
};

  return (
    <div>
      <h1 style={{ color: "#1009E6" }}>
        🔐 Connexion
      </h1>
{user ? (
  <p>
    ✅ Connecté : {playerName || user.email}
    {user && (
  <button onClick={signOut}>
    Déconnexion
  </button>
)}
  </p>
) : (
  <p>
    ❌ Aucun utilisateur connecté
  </p>
)}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={signIn}>
        Se connecter
      </button>

      <button
        onClick={signUp}
        style={{ marginLeft: "10px" }}
      >
        Créer un compte
      </button>
    </div>
  );
}

export default Login;
