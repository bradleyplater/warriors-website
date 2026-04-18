import { useEffect, useState } from "react";
import { Text } from "@wonderflow/react-components";

const bannerImages = [
  "/images/team/charity-game.jpg",
  "/images/team/LLIHC-Team-26.jpg",
  "/images/team/tournament-win.jpg",
  "/images/team/tournament.jpg",
];

export function HeroBanner() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImage((currentImage) => (currentImage + 1) % bannerImages.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="home-hero-shell">
      <div className="home-hero">
        <div className="home-hero-media" aria-hidden="true">
          {bannerImages.map((image, index) => (
            <div
              key={image}
              className={index === activeImage ? "home-hero-image home-hero-image-active" : "home-hero-image"}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="home-hero-overlay" />
        </div>

        <div className="home-hero-content">
          <span className="home-hero-kicker">Welcome To The Warriors</span>
          <Text as="h1" variant="heading-1" className="home-hero-title">
            Peterborough Warriors
          </Text>
          <Text variant="heading-6" className="home-hero-subtitle">
            Recreational ice hockey team bringing together players of all skill levels
          </Text>
          <div className="home-hero-indicators" aria-label="Banner images">
            {bannerImages.map((image, index) => (
              <button
                key={image}
                type="button"
                className={index === activeImage ? "home-hero-indicator home-hero-indicator-active" : "home-hero-indicator"}
                onClick={() => setActiveImage(index)}
                aria-label={`Show banner image ${index + 1}`}
                aria-pressed={index === activeImage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}