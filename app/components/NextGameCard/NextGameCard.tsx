import { Text } from "@wonderflow/react-components";
import upcomingGames from "../../../public/data/upcoming-games.json";
import "./NextGameCard.css";



type UpcomingGame = {
  opponentTeam: string;
  logoImage: string;
  gameType: string;
  date: string;
  time: string;
  location: string;
};

function parseGameDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function formatGameDate(dateString: string) {
  return parseGameDate(dateString).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function NextGameCard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextGame = [...(upcomingGames as UpcomingGame[])]
    .sort(
      (a, b) =>
        parseGameDate(a.date).getTime() - parseGameDate(b.date).getTime()
    )
    .find((game) => parseGameDate(game.date).getTime() >= today.getTime());

  return (
    <div className="next-game-shell">
      <section className="next-game-card" aria-labelledby="next-game-heading">
        {nextGame ? (
          <>
            <span className="next-game-kicker">Next Game</span>

            <div className="next-game-header-centered">
              <div className="next-game-logo-wrap">
                <img
                  src={`/images/team-logos/${nextGame.logoImage}`}
                  alt={`${nextGame.opponentTeam} logo`}
                  className="next-game-logo"
                />
              </div>

              <Text
                as="h2"
                variant="heading-2"
                className="next-game-opponent-name"
                id="next-game-heading"
              >
                {nextGame.opponentTeam}
              </Text>
            </div>

            <dl className="next-game-meta">
              <div className="next-game-meta-row">
                <dt>Date</dt>
                <dd>{formatGameDate(nextGame.date)}</dd>
              </div>

              <div className="next-game-meta-row">
                <dt>Faceoff</dt>
                <dd>{nextGame.time}</dd>
              </div>

              <div className="next-game-meta-row">
                <dt>Venue</dt>
                <dd>{nextGame.location}</dd>
              </div>

              <div className="next-game-meta-row">
                <dt>Competition</dt>
                <dd>{nextGame.gameType}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="next-game-copy">
            <span className="next-game-kicker">Next Game</span>
            <Text
              as="h2"
              variant="heading-3"
              className="next-game-title"
              id="next-game-heading"
            >
              More fixtures coming soon
            </Text>
            <Text variant="body-1" className="next-game-summary">
              The upcoming schedule will appear here once new matches are
              published.
            </Text>
          </div>
        )}
      </section>
    </div>
  );
}