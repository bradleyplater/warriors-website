import "./live.css";

export function meta() {
  return [{ title: "Live — Peterborough Warriors" }];
}

export default function Live() {
  return (
    <div className="live-page">
      <section className="live-hero">
        <div className="live-hero-inner">
          <span className="live-kicker">Watch</span>
          <h1 className="live-title">Live Stream</h1>
          <p className="live-subtitle">
            Watch Peterborough Warriors games live when available
          </p>
        </div>
      </section>

      <section className="live-body">
        <div className="live-frame">
          <div className="live-embed">
            <iframe
              src="https://peterboroughpredators.com/warriors-embed.php"
              className="live-embed-iframe"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Warriors Live"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
