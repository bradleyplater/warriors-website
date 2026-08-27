import "./ds.css";

export type BarDatum = { label: string; value: number; title?: string };

type Props = {
  data: BarDatum[];
  height?: number;
  /** A single series stays monochrome; categorical colour is the exception. */
  monochrome?: boolean;
  /** Used for the hover readout, and for the printed figure when showValues is on. */
  formatValue?: (value: number) => string;
  /** Prints the figure above each bar. Bars shrink to leave room for it. */
  showValues?: boolean;
  className?: string;
};

/** Reserved for the printed figure when showValues is on, as a share of the plot. */
const VALUE_HEADROOM = 0.86;

export function BarChart({
  data,
  height = 180,
  monochrome = true,
  formatValue,
  showValues = false,
  className,
}: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const scale = showValues ? VALUE_HEADROOM : 1;
  const classes = ["ds-barchart", className].filter(Boolean).join(" ");
  return (
    <div className={classes} style={{ height }}>
      {data.map((d, i) => {
        const readout = formatValue ? formatValue(d.value) : String(d.value);
        return (
          <div className="ds-barchart-col" key={`${d.label}-${i}`}>
            <div className="ds-barchart-plot" title={d.title ?? `${d.label}: ${readout}`}>
              {showValues ? <span className="ds-barchart-value">{readout}</span> : null}
              <div
                className="ds-barchart-bar"
                style={{
                  height: `${(d.value / max) * 100 * scale}%`,
                  background: monochrome ? "var(--series-1)" : `var(--series-${(i % 6) + 1})`,
                }}
              />
            </div>
            <span className="ds-barchart-label">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
