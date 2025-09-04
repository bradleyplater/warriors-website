import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("spotlights", "routes/spotlights.tsx"),
  route("upcoming-games", "routes/upcoming-games.tsx"),
  route("results", "routes/results.tsx"),
  route("players", "routes/players.tsx"),
  route("team", "routes/team.tsx"),
  route("player-stats", "routes/player-stats.tsx"),
  route("team-stats", "routes/team-stats.tsx"),
  route("player/:playerId", "routes/player.$playerId.tsx")
] satisfies RouteConfig;
