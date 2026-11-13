import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Team from "./pages/Team";
import Rankings from "./pages/Rankings";
import Results from "./pages/Results";
import More from "./pages/More";
import Player from "./pages/Player";
import logo from "./assets/Logo US Nubar.jpg";
import MarcelDor from "./pages/MarcelDor";
import Puskas from "./pages/Puskas";
import Match from "./pages/Match";
import Login from "./pages/Login";

function App() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-header">
          <img src={logo} alt="Logo US NUBAR" />
          <h1>US NUBAR</h1>
        </header>

        <nav className="app-nav">
          <NavLink to="/" className={navClass}>
            <span className="nav-icon">🏠</span>
            <span>Accueil</span>
          </NavLink>

          <NavLink to="/team" className={navClass}>
            <span className="nav-icon">👥</span>
            <span>Équipe</span>
          </NavLink>

          <NavLink to="/rankings" className={navClass}>
            <span className="nav-icon">🏆</span>
            <span>Classements</span>
          </NavLink>

          <NavLink to="/results" className={navClass}>
            <span className="nav-icon">📅</span>
            <span>Calendrier</span>
          </NavLink>

          <NavLink to="/more" className={navClass}>
            <span className="nav-icon">⭐</span>
            <span>Autres</span>
          </NavLink>

          <NavLink to="/login" className={navClass}>
            <span className="nav-icon">🔐</span>
            <span>Connexion</span>
          </NavLink>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/team" element={<Team />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/results" element={<Results />} />
            <Route path="/more" element={<More />} />
            <Route path="/player/:id" element={<Player />} />
            <Route path="/marcel-dor" element={<MarcelDor />} />
            <Route path="/puskas" element={<Puskas />} />
            <Route path="/match/:id" element={<Match />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
