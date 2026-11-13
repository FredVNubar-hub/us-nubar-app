import { Link } from "react-router-dom";

function More() {
  const cards = [
    {
      icon: "🏆",
      title: "Marcel d'Or",
      description: "Nominations de la saison, votes secrets et palmarès",
      link: "/marcel-dor",
      ready: true,
    },
    {
      icon: "⚽",
      title: "Prix Puskas",
      description: "Les plus beaux buts et gestes techniques du club",
      link: "/puskas",
      ready: true,
    },
    {
      icon: "👑",
      title: "Hall of Fame",
      description: "Les légendes historiques de l'US NUBAR",
      link: "/hall-of-fame",
      ready: false,
    },
    {
      icon: "📜",
      title: "Records",
      description: "Les statistiques et records absolus du club",
      link: "/records",
      ready: false,
    },
  ];

  return (
    <div>
      <h1 style={{ color: "#1009E6", fontSize: "24px", marginBottom: "16px" }}>
        ⭐ Plus & Trophées
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.ready ? card.link : "#"}
            onClick={(e) => {
              if (!card.ready) {
                e.preventDefault();
                alert("🚧 Cette rubrique arrive bientôt !");
              }
            }}
            style={{
              textDecoration: "none",
              color: "inherit",
              opacity: card.ready ? 1 : 0.75,
            }}
          >
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "16px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "12px",
                    backgroundColor: "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ color: "#0F172A", margin: 0, fontSize: "17px" }}>
                      {card.title}
                    </h3>
                    {!card.ready && (
                      <span
                        style={{
                          backgroundColor: "#F1F5F9",
                          color: "#64748B",
                          fontSize: "11px",
                          fontWeight: "bold",
                          padding: "2px 8px",
                          borderRadius: "10px",
                        }}
                      >
                        Bientôt
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748B" }}>
                    {card.description}
                  </p>
                </div>
              </div>

              <span style={{ color: "#1009E6", fontWeight: "bold", fontSize: "18px" }}>
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default More;
