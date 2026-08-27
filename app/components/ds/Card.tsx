import type { HTMLAttributes } from "react";
import "./ds.css";

type Props = HTMLAttributes<HTMLDivElement> & {
  elevation?: 1 | 2 | 3;
  flush?: boolean;
};

export function Card({ elevation = 1, flush = false, className, ...rest }: Props) {
  const classes = [
    "ds-card",
    `ds-card-e${elevation}`,
    flush ? "ds-card-flush" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...rest} />;
}
