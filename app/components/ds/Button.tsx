import type { ButtonHTMLAttributes } from "react";
import "./ds.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...rest
}: Props) {
  const classes = ["ds-btn", `ds-btn-${variant}`, `ds-btn-${size}`, className]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={classes} {...rest} />;
}
