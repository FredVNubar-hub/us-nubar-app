import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Team from "./pages/Team";
import Rankings from "./pages/Rankings";
import Results from "./pages/Results";
import More from "./pages/More";
import Player from "./pages/Player";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: "20px" }}>
        <h1>⚽ US NUBAR</h1>

        <nav
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <Link to="/">Accueil</Link>
          <Link to="/team">Équipe</Link>
          <Link to="/rankings">Classements</Link>
          <Link to="/results">Résultats</Link>
          <Link to="/more">Autres</Link>
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