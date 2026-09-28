import type { HTMLAttributes } from "react";
import "./ds.css";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const GLYPHS: Record<Tone, string> = {
  success: "✓",
  warning: "!",
  danger: "✕",
  info: "i",
  neutral: "—",
};

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  glyph?: string | null;
};

export function Badge({ tone = "neutral", glyph, className, children, ...rest }: Props) {
  const mark = glyph === null ? null : glyph || GLYPHS[tone];
  const classes = ["ds-badge", `ds-badge-${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {mark ? <span aria-hidden="true">{mark}</span> : null}
      {children}
    </span>
  );
}
