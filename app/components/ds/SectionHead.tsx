import type { HTMLAttributes, ReactNode } from "react";
import "./ds.css";

type Props = HTMLAttributes<HTMLDivElement> & {
  eyebrow?: ReactNode;
  title?: ReactNode;
};

export function SectionHead({ eyebrow, title, className, children, ...rest }: Props) {
  const classes = ["ds-section-head", className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      {eyebrow ? <span className="t-label ds-section-head-eyebrow">{eyebrow}</span> : null}
      {title ? <h2 className="t-heading ds-section-head-title">{title}</h2> : null}
      {children ? <p className="ds-section-head-body">{children}</p> : null}
    </div>
  );
}
