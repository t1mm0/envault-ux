/**
 * Atom: typographic primitives (atomic design).
 */
import { v } from "../../theme/cssVars.js";

/** Visually hidden label for a11y */
export function SrOnly({ children, ...props }) {
  const s = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  };
  return (
    <span style={s} {...props}>
      {children}
    </span>
  );
}

/** Serif display heading */
export function Heading({ level = 1, children, style, ...props }) {
  const Tag = `h${Math.min(level, 6)}`;
  const sizes = { 1: 26, 2: 22, 3: 18 };
  return (
    <Tag
      style={{
        fontFamily: v("fontSerif"),
        fontWeight: 400,
        color: v("textPrimary"),
        fontSize: sizes[level] ?? 26,
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function BodyText({ muted, mono, bold, children, style, ...props }) {
  return (
    <p
      style={{
        fontFamily: mono ? v("fontMono") : v("fontSans"),
        fontSize: 13,
        color: muted ? v("textMuted") : v("textPrimary"),
        fontWeight: bold ? 600 : 400,
        lineHeight: 1.6,
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
}
