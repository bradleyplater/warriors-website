import LatestResultSpotlight from "~/components/last-result-spotlight/last-result-spotlight";
import SpotlightCard from "~/components/spotlight-card/spotlight-card";
import UpcomingGameSpotlight from "~/components/upcoming-game-spotlight/upcoming-game-spotlight";

export function Welcome() {
  return (
    <main className="flex items-center justify-center pb-4">
      <div className="flex-1 flex flex-col items-center min-h-0">
        <header className="flex flex-col items-center">
          <img
            src="images/warriors-logo-black.png"
            alt="Logo"
            className="max-h-full md:max-w-1/9 max-w-1/2"
          ></img>
        </header>
        <div className="px-4 w-full grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-fr place-items-center">
          <SpotlightCard cardHeader="Next Game">
          <UpcomingGameSpotlight/>
          </SpotlightCard>
          <SpotlightCard cardHeader="Last Result">
            <LatestResultSpotlight/>
          </SpotlightCard>
          <SpotlightCard cardHeader="Team Stats">
            This will contain Team Stats
          </SpotlightCard>

          <SpotlightCard cardHeader="Goals">
            This will contain goals cards
          </SpotlightCard>
          <SpotlightCard cardHeader="Assists">
            This will contain assists cards
          </SpotlightCard>
          <SpotlightCard cardHeader="Points">
            This will contain points cards
          </SpotlightCard>
        </div>
      </div>
    </main>
  );
}
