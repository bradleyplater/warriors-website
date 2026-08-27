import { useEffect, useRef, useState } from "react";
import { NavLink, Link } from "react-router";
import { Button } from "./ds/Button";
import "./NavBar.css";

type Kit = "home" | "away";

const navLinks = [
  { name: "Home", to: "/", end: true },
  { name: "Schedule", to: "/schedule", end: true },
  { name: "Results", to: "/results", end: true },
  { name: "Roster", to: "/roster", end: true },
  { name: "Stats", to: "/stats", end: true },
  { name: "Team Stats", to: "/team-stats", end: true },
  { name: "Records", to: "/records", end: true },
  { name: "Awards", to: "/awards", end: true },
  { name: "Live", to: "/live", end: true },
];

export function NavBar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [kit, setKit] = useState<Kit>("home");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("theme-mode");
    const next: Kit = saved === "away" || saved === "home" ? saved : "home";
    setKit(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return;
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobileOpen]);

  function selectKit(next: Kit) {
    setKit(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("theme-mode", next);
  }

  const logoSrc = kit === "home" ? "/images/warriors-logo-white.png" : "/images/warriors-logo-black.png";

  return (
    <>
      <header className="navbar-shell">
        <div className="navbar-frame">
          <Link to="/" className="navbar-brand" aria-label="Peterborough Warriors — home">
            <img src={logoSrc} alt="Peterborough Warriors" className="navbar-logo" />
          </Link>

          <nav className="navbar-links" aria-label="Primary">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.to} end={link.end} className="navbar-link-reset">
                {({ isActive }) => (
                  <span className={isActive ? "navbar-link t-label navbar-link-active" : "navbar-link t-label"}>
                    {link.name}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="navbar-kit-toggle" role="group" aria-label="Kit">
            <Button
              size="sm"
              variant={kit === "home" ? "primary" : "secondary"}
              aria-pressed={kit === "home"}
              onClick={() => selectKit("home")}
            >
              Home
            </Button>
            <Button
              size="sm"
              variant={kit === "away" ? "primary" : "secondary"}
              aria-pressed={kit === "away"}
              onClick={() => selectKit("away")}
            >
              Away
            </Button>
          </div>

          <button
            type="button"
            ref={menuButtonRef}
            className="navbar-menu-button"
            aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileOpen((open) => !open)}
          >
            <span className="navbar-menu-lines" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      {isMobileOpen && (
        <>
          <div className="navbar-drawer-backdrop" onClick={() => setIsMobileOpen(false)} />
          <div className="navbar-drawer" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <div className="navbar-drawer-header">
              <img src={logoSrc} alt="Peterborough Warriors" className="navbar-drawer-logo" />
              <button
                type="button"
                ref={closeButtonRef}
                className="navbar-drawer-close"
                aria-label="Close navigation menu"
                onClick={() => {
                  setIsMobileOpen(false);
                  menuButtonRef.current?.focus();
                }}
              >
                ✕
              </button>
            </div>
            <nav id="mobile-navigation" className="navbar-drawer-nav" aria-label="Mobile primary">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.to}
                  end={link.end}
                  className="navbar-link-reset"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {({ isActive }) => (
                    <span className={isActive ? "navbar-drawer-link t-label navbar-drawer-link-active" : "navbar-drawer-link t-label"}>
                      {link.name}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="navbar-drawer-kit">
              <Button
                variant={kit === "home" ? "primary" : "secondary"}
                aria-pressed={kit === "home"}
                onClick={() => selectKit("home")}
              >
                Home · black
              </Button>
              <Button
                variant={kit === "away" ? "primary" : "secondary"}
                aria-pressed={kit === "away"}
                onClick={() => selectKit("away")}
              >
                Away · white
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
