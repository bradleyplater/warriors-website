import { useRef, useState } from "react";
import "./GamePhotos.css";

export type GamePhoto = { src: string; alt: string; caption?: string };

/**
 * Stand-in slides until the club's game photos are wired up. Each one names
 * the kind of shot the slot is for, as in the design.
 */
const PLACEHOLDERS = [
  "Warm-up",
  "Opening face-off",
  "Goal celebration",
  "Goaltender in the crease",
  "The bench",
  "Handshakes at full time",
];

/**
 * Manual carousel for a game's photos: arrows, dots, counter, arrow keys and
 * swipe. No autoplay, so it only moves when you move it. Pass `photos` to show
 * real images; with none, it shows labelled placeholder slides.
 */
export function GamePhotos({ photos = [] }: { photos?: GamePhoto[] }) {
  const placeholder = photos.length === 0;
  const count = placeholder ? PLACEHOLDERS.length : photos.length;
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = (i: number) => setIndex(((i % count) + count) % count);
  const pad = (n: number) => String(n).padStart(2, "0");
  const caption = placeholder
    ? "Photos from this game will appear here."
    : photos[index].caption ?? photos[index].alt;

  return (
    <section aria-label="Photos from the game" className="game-photos">
      <div className="game-photos-head">
        <h2 className="t-heading game-photos-title">Photos from the game</h2>
        <span className="t-label game-photos-note">
          {placeholder ? "Coming soon · club photographer" : `${count} photos`}
        </span>
      </div>

      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Photos from the game"
        tabIndex={0}
        className="game-photos-carousel"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
          if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
        }}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        <div className="game-photos-viewport">
          <div className="game-photos-track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {placeholder
              ? PLACEHOLDERS.map((subject, i) => (
                  <div
                    key={subject}
                    role="img"
                    aria-label={`Placeholder: ${subject}`}
                    className="game-photos-slide game-photos-slide--placeholder"
                  >
                    <span className="t-label game-photos-note">Photograph {pad(i + 1)} — placeholder</span>
                    <span className="t-heading game-photos-subject">{subject}</span>
                    <span className="t-data game-photos-note">16:9</span>
                  </div>
                ))
              : photos.map((photo, i) => (
                  <div key={photo.src} className="game-photos-slide">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="game-photos-image"
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </div>
                ))}
          </div>
        </div>

        <div className="game-photos-bar">
          <p className="game-photos-caption">{caption}</p>
          <div className="game-photos-controls">
            <div className="game-photos-dots">
              {Array.from({ length: count }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Photograph ${i + 1} of ${count}`}
                  aria-pressed={i === index}
                  className="game-photos-dot"
                  onClick={() => go(i)}
                />
              ))}
            </div>
            <span className="t-data game-photos-note game-photos-counter">
              {pad(index + 1)} / {pad(count)}
            </span>
            <div className="game-photos-arrows">
              <button type="button" aria-label="Previous photograph" className="game-photos-arrow" onClick={() => go(index - 1)}>←</button>
              <button type="button" aria-label="Next photograph" className="game-photos-arrow" onClick={() => go(index + 1)}>→</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
