/**
 * Atom: button — semantic variants mapped to themed tokens for reuse everywhere.
 */
import { v } from "../../theme/cssVars.js";

const base = {
  fontFamily: v("fontSans"),
  cursor: "pointer",
  borderRadius: v("radiusLg"),
  fontWeight: 600,
  fontSize: 13,
};

const variants = {
  approve: {
    ...base,
    background: v("inverseBg"),
    color: v("inverseFg"),
    border: "none",
    padding: "10px 20px",
    fontWeight: 700,
  },
  ghost: {
    ...base,
    background: v("bgChip"),
    color: v("textMuted"),
    border: `1px solid ${v("borderInput")}`,
    padding: "10px 16px",
  },
  reject: {
    ...base,
    background: v("bgPanel"),
    color: v("accentRose"),
    border: `1px solid ${v("accentRoseMutedBorder")}`,
    padding: "10px 16px",
  },
  outline: {
    ...base,
    background: v("bgPanel"),
    color: v("brand"),
    border: `2px solid ${v("brand")}`,
    padding: "10px 18px",
    fontWeight: 700,
  },
  rule: {
    ...base,
    background: v("bgPanel"),
    color: v("textLink"),
    border: `1px solid ${v("accentBlueMutedBorder")}`,
    padding: "10px 14px",
    fontSize: 12,
  },
  linkBare: {
    ...base,
    background: "none",
    border: "none",
    color: v("textLink"),
    padding: "1px 4px",
    fontSize: 10,
    textDecoration: "underline",
    fontWeight: 500,
  },
};

export function Button({ variant = "ghost", style, disabled, type = "button", ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      style={{ ...variants[variant], opacity: disabled ? 0.45 : 1, ...style }}
      {...props}
    />
  );
}
