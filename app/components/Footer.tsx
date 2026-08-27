import { Stripe } from "./ds/Stripe";
import "./Footer.css";

export function Footer() {
  return (
    <>
      <Stripe />
      <footer className="site-footer">
        <div className="site-footer-grid">
          <div>
            <img src="/images/warriors-logo-white.png" alt="Peterborough Warriors" className="site-footer-logo" />
            <p className="site-footer-address">
              Planet Ice Peterborough
              <br />
              Mallard Road, Bretton
              <br />
              Peterborough PE3 8YN
            </p>
          </div>
          <div>
            <span className="t-label site-footer-heading">Contact &amp; follow</span>
            <p className="site-footer-text">
              All club enquiries go through Facebook — message the page and a committee member will reply.
            </p>
            <ul className="site-footer-links">
              <li>
                <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                  Facebook — Peterborough Warriors
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <span className="t-label site-footer-heading">Affiliation</span>
            <p className="site-footer-text">
              Affiliated to England Ice Hockey. Competing in the EIH Recreational League South, Division 2.
            </p>
          </div>
        </div>
        <div className="site-footer-bottom">
          <div className="site-footer-bottom-inner">
            <span className="t-label muted">© {new Date().getFullYear()} Peterborough Warriors Ice Hockey Club</span>
          </div>
        </div>
      </footer>
    </>
  );
}
