import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Peterborough Warriors" },
  ];
}

export default function Home() {
  return "hello";
}
