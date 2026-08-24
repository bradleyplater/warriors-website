import "./RouteLoadingFallback.css";

export function RouteLoadingFallback() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <div className="route-loading-spinner" aria-hidden="true" />
      <span className="route-loading-text">Loading…</span>
    </div>
  );
}
