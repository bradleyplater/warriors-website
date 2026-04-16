import { useState } from "react";
import "./TeamLogo.css";

function getInitials(teamName: string): string {
  return teamName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .slice(0, 3)
    .join("");
}

type Props = {
  src: string;
  teamName: string;
  className?: string;
  wrapClassName?: string;
};

export function TeamLogo({ src, teamName, className, wrapClassName }: Props) {
  const [failed, setFailed] = useState(false);
  const initials = getInitials(teamName);

  return (
    <div className={`next-game-logo-wrap ${wrapClassName ?? ""}`}>
      {failed ? (
        <svg
          className={`team-logo-fallback ${className ?? ""}`}
          viewBox="0 0 72 72"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={teamName}
          role="img"
        >
          <defs>
            <linearGradient id={`tlg-${initials}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a6e" />
              <stop offset="100%" stopColor="#1a56db" />
            </linearGradient>
          </defs>
          {/* Outer shield shape */}
          <path
            d="M36 4 L62 14 L62 38 C62 54 50 64 36 68 C22 64 10 54 10 38 L10 14 Z"
            fill={`url(#tlg-${initials})`}
          />
          {/* Inner shield highlight */}
          <path
            d="M36 10 L56 18 L56 38 C56 51 46 59 36 63 C26 59 16 51 16 38 L16 18 Z"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          {/* Initials */}
          <text
            x="36"
            y={initials.length >= 3 ? "42" : "44"}
            textAnchor="middle"
            fill="white"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize={initials.length >= 3 ? "16" : "20"}
            letterSpacing="1"
          >
            {initials}
          </text>
        </svg>
      ) : (
        <img
          src={src}
          alt={`${teamName} logo`}
          className={`next-game-logo ${className ?? ""}`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
