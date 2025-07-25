import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("player-stats", "routes/player-stats.tsx")
] satisfies RouteConfig;
