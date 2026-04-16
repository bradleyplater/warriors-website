import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("schedule", "routes/schedule.tsx"),
  route("roster", "routes/roster.tsx"),
] satisfies RouteConfig;
