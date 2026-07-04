export function LogoIcon({ size = 44 }: { size?: number }) {
  const w = Math.round(size * (32 / 46));
  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 32 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Subkoru"
    >
      <path
        d="M26 10C26 3 6 3 6 17C6 23 26 23 26 29C26 43 6 43 6 36"
        stroke="#4f46e5"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({
  size = 36,
  textColor = "#0f172a",
  showText = true,
}: {
  size?: number;
  textColor?: string;
  showText?: boolean;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.35) }}>
      <LogoIcon size={size} />
      {showText && (
        <span
          style={{
            fontWeight: 700,
            fontSize: Math.round(size * 0.48),
            letterSpacing: "-0.4px",
            color: textColor,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            lineHeight: 1,
          }}
        >
          Subkoru
        </span>
      )}
    </span>
  );
}
