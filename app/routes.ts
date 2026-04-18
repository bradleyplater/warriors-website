import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("schedule", "routes/schedule.tsx"),
  route("results", "routes/results.tsx"),
  route("roster", "routes/roster.tsx"),
  route("roster/:playerId", "routes/player.tsx"),
  route("results/:gameId", "routes/game.tsx"),
  route("stats", "routes/stats.tsx"),
  route("team-stats", "routes/team-stats.tsx"),
  route("records", "routes/records.tsx"),
] satisfies RouteConfig;
