import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import Home from "./pages/Home";
import Team from "./pages/Team";
import Rankings from "./pages/Rankings";
import Results from "./pages/Results";
import More from "./pages/More";
import Player from "./pages/Player";
import logo from "./assets/Logo US Nubar.jpg";
const navStyle = ({ isActive }: { isActive: boolean }) => ({
  backgroundColor: isActive ? "#1E90D8" : "#0B4F7D",
  color: "white",
  padding: "10px 15px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: isActive ? "bold" : "normal",
});

function App() {
  return (
    <BrowserRouter>
      <div
  style={{
    padding: "20px",
    backgroundColor: "#F5F8FC",
    minHeight: "100vh",
    maxWidth: "900px",
    margin: "0 auto",
  }}
>
        <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  }}
>
  <img
    src={logo}
    alt="Logo US NUBAR"
    style={{
      width: "90px",
      height: "90px",
      objectFit: "contain",
    }}
  />

  <h1
    style={{
      color: "#0B4F7D",
      margin: 0,
      fontSize: "56px",
    }}
  >
    US NUBAR
  </h1>
</div>


        <nav
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <NavLink to="/" style={navStyle}>
  🏠 Accueil
</NavLink>

<NavLink to="/team" style={navStyle}>
  👥 Équipe
</NavLink>

<NavLink to="/rankings" style={navStyle}>
  🏆 Classements
</NavLink>

<NavLink to="/results" style={navStyle}>
  ⚽ Résultats
</NavLink>

<NavLink to="/more" style={navStyle}>
  ⭐ Autres
</NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/results" element={<Results />} />
          <Route path="/more" element={<More />} />

          <Route path="/player/:id" element={<Player />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;