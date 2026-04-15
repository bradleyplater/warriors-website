import { useState } from "react";
import { NavLink, Link } from "react-router";
import { Drawer, OverlayContainer, Text } from "@wonderflow/react-components";

export function NavBar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navLinks = [
    { name: "Home", to: "/", end: true },
    { name: "Club", to: "/club", end: true },
  ];

  return (
    <>
      <header className="navbar-shell">
        <div className="navbar-frame">
          <Link to="/" className="navbar-brand" aria-label="Warriors home">
            <span className="navbar-logo-badge">
              <img
                src="/images/warriors-logo-black.png"
                alt="Warriors logo"
                className="navbar-logo"
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
            title={
              <img
                src="/images/warriors-logo-black.png"
                alt="Warriors"
                className="navbar-drawer-logo"
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
          </Drawer>
        )}
      </OverlayContainer>
    </>
  );
}
