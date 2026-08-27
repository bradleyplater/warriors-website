import "./ds.css";

export type Stat = { label: string; value: string | number; unit?: string };

type Props = { stats: Stat[]; min?: number; className?: string };

export function StatGrid({ stats, min = 120, className }: Props) {
  const classes = ["ds-statgrid", className].filter(Boolean).join(" ");
  return (
    <div className={classes} style={{ gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))` }}>
      {stats.map((s, i) => (
        <div key={i} className="ds-statgrid-item">
          <span className="t-label muted">{s.label}</span>
          <span className="ds-statgrid-value">
            {s.value}
            {s.unit ? <small className="ds-statgrid-unit">{s.unit}</small> : null}
          </span>
        </div>
      ))}
    </div>
  );
}
