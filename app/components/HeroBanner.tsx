import { useEffect, useRef, useState } from "react";
import "./HeroBanner.css";

const slides = [
  { image: "/images/team/charity-game.jpg", caption: "The Warriors at a club charity game" },
  { image: "/images/team/LLIHC-Team-26.jpg", caption: "The 2025/26 squad" },
  { image: "/images/team/tournament-win.jpg", caption: "Celebrating a tournament win" },
  { image: "/images/team/tournament.jpg", caption: "On the ice at a club tournament" },
];

export function HeroBanner() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || paused) return;
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [paused]);

  function go(i: number) {
    setSlide(((i % slides.length) + slides.length) % slides.length);
  }

  return (
    <div className="hero-banner">
      <section
        aria-label="Club photography"
        tabIndex={0}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); go(slide - 1); }
          if (e.key === "ArrowRight") { e.preventDefault(); go(slide + 1); }
        }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 40) go(slide + (dx < 0 ? 1 : -1));
          touchStartX.current = null;
        }}
      >
        <div className="hero-banner-viewport">
          <div className="hero-banner-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
            {slides.map((s, i) => (
              <div
                key={s.image}
                role="img"
                aria-label={s.caption}
                className="hero-banner-slide"
                style={{ backgroundImage: `url(${s.image})` }}
              />
            ))}
          </div>
        </div>

        <div className="hero-banner-caption-bar">
          <div className="hero-banner-caption-inner">
            <div className="hero-banner-caption-copy">
              <span className="t-label muted">Peterborough Warriors · Est. 2013 · Planet Ice Peterborough</span>
              <p>{slides[slide].caption}</p>
            </div>
            <div className="hero-banner-controls">
              <div className="hero-banner-dots" role="tablist" aria-label="Slides">
                {slides.map((s, i) => (
                  <button
                    key={s.image}
                    type="button"
                    role="tab"
                    aria-selected={i === slide}
                    aria-label={`Slide ${i + 1}: ${s.caption}`}
                    onClick={() => go(i)}
                    className="hero-banner-dot"
                  />
                ))}
              </div>
              <span className="t-data hero-banner-counter">
                {String(slide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
              <div className="hero-banner-arrows">
                <button type="button" aria-label="Previous slide" className="hero-banner-arrow" onClick={() => go(slide - 1)}>←</button>
                <button type="button" aria-label="Next slide" className="hero-banner-arrow" onClick={() => go(slide + 1)}>→</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
