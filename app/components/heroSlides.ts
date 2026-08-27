export type HeroSlide = { image: string; caption: string };

/**
 * Every photo in public/images/team must appear here — hero-slides.test.ts
 * fails the build if one is missing, so a dropped-in photo can't go unnoticed.
 */
export const heroSlides: HeroSlide[] = [
  { image: "/images/team/charity-game.jpg", caption: "The Warriors at a club charity game" },
  { image: "/images/team/LLIHC-Team-26.jpg", caption: "The 2025/26 squad" },
  { image: "/images/team/tournament-win.jpg", caption: "Celebrating a tournament win" },
  { image: "/images/team/tournament.jpg", caption: "On the ice at a club tournament" },
  { image: "/images/team/tournament-2.jpg", caption: "Lining up at a club tournament" },
  { image: "/images/team/tournament-3.jpg", caption: "Tournament weekend with the Warriors" },
  { image: "/images/team/netherlands.jpg", caption: "The Warriors on tour in the Netherlands" },
  { image: "/images/team/romford.jpg", caption: "Road trip to Romford" },
];
