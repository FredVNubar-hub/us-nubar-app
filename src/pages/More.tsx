import { Link } from "react-router-dom";

function More() {
  const cards = [
    {
      title: "🏆 Marcel d'Or",
      description: "Voir l'historique des Marcel d'Or",
      link: "/marcel-dor",
    },
    {
      title: "⚽ Puskas",
      description: "Voir les plus beaux gestes et buts",
      link: "/puskas",
    },
    {
      title: "👑 Hall of Fame",
      description: "Les légendes de l'US NUBAR",
      link: "/hall-of-fame",
    },
    {
      title: "📜 Records",
      description: "Les records du club",
      link: "/records",
    },
  ];

  return (
    <div>
      {cards.map((card) => (
        <Link
          key={card.title}
          to={card.link}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "25px",
              marginBottom: "20px",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(16,9,230,0.15)",
              border: "1px solid #E5E7EB",
              cursor: "pointer",
            }}
          >
            <h3 style={{ color: "#1009E6" }}>
              {card.title}
            </h3>

            <p>{card.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default More;