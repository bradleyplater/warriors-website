import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router";
import { Drawer, OverlayContainer, Text } from "@wonderflow/react-components";

type ThemeMode = "light" | "dark";

export function NavBar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");

  const navLinks = [
    { name: "Home", to: "/", end: true },
    { name: "Club", to: "/club", end: true },
  ];

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme-mode");
    const nextTheme: ThemeMode =
      savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";

    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("theme-mode", nextTheme);
  }

  return (
    <>
      <header className="navbar-shell">
        <div className="navbar-frame">
          <Link to="/" className="navbar-brand" aria-label="Warriors home">
            <span className="navbar-logo-badge">
              <img
                src={
                  theme === "dark"
                    ? "/images/warriors-logo-white.png"
                    : "/images/warriors-logo-black.png"
                }
                alt="Warriors logo"
                className={theme === "dark" ? "navbar-logo navbar-logo-dark" : "navbar-logo"}
              />
            </span>
            <span className="navbar-brand-copy">
              <Text variant="heading-5" className="navbar-brand-title">
                Warriors
              </Text>
              <Text variant="body-1" className="navbar-brand-subtitle">
                Ice Hockey Club
              </Text>
            </span>
          </Link>

          <nav className="navbar-links" aria-label="Primary">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.to} end className="navbar-link-reset">
                {({ isActive }) => (
                  <span className={isActive ? "navbar-link navbar-link-active" : "navbar-link"}>
                    <Text variant="body-1" className="navbar-link-label">
                      {link.name}
                    </Text>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
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

      <OverlayContainer index={80} obfuscate onClose={() => setIsMobileOpen(false)}>
        {isMobileOpen && (
          <Drawer
            className="navbar-drawer"
            theme={theme}
            title={
              <img
                src={
                  theme === "dark"
                    ? "/images/warriors-logo-white.png"
                    : "/images/warriors-logo-black.png"
                }
                alt="Warriors"
                className={
                  theme === "dark"
                    ? "navbar-drawer-logo navbar-drawer-logo-dark"
                    : "navbar-drawer-logo"
                }
              />
            }
            side="right"
            maxWidth="24rem"
            closeOnClickOutside
            showHeader
          >
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
                    <span
                      className={
                        isActive
                          ? "navbar-drawer-link navbar-drawer-link-active"
                          : "navbar-drawer-link"
                      }
                    >
                      <Text variant="body-1" className="navbar-drawer-link-label">
                        {link.name}
                      </Text>
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="navbar-theme-toggle-wrap">
              <button
                type="button"
                className="navbar-theme-toggle"
                onClick={toggleTheme}
                aria-pressed={theme === "dark"}
              >
                <span className="navbar-theme-toggle-copy">
                  <Text variant="body-1" className="navbar-theme-toggle-title">
                    Dark mode
                  </Text>
                  <Text variant="body-2" className="navbar-theme-toggle-subtitle">
                    Switch the site appearance
                  </Text>
                </span>
                <span
                  className={
                    theme === "dark"
                      ? "navbar-theme-toggle-track navbar-theme-toggle-track-active"
                      : "navbar-theme-toggle-track"
                  }
                  aria-hidden="true"
                >
                  <span className="navbar-theme-toggle-thumb" />
                </span>
              </button>
            </div>
          </Drawer>
        )}
      </OverlayContainer>
    </>
  );
}
