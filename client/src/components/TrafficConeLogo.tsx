interface TrafficConeLogoProps {
  className?: string;
  size?: number;
}

export function TrafficConeLogo({ className = "", size = 32 }: TrafficConeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="About Town Logo"
    >
      <rect x="6" y="42" width="36" height="4" rx="1" fill="hsl(var(--foreground))" opacity="0.8" />
      <path
        d="M24 4L36 42H12L24 4Z"
        fill="hsl(25 90% 50%)"
        stroke="hsl(25 90% 40%)"
        strokeWidth="1"
      />
      <rect x="16" y="14" width="16" height="4" rx="0.5" fill="white" opacity="0.95" />
      <rect x="14" y="24" width="20" height="4" rx="0.5" fill="white" opacity="0.95" />
      <rect x="12" y="34" width="24" height="4" rx="0.5" fill="white" opacity="0.95" />
      <ellipse cx="24" cy="6" rx="3" ry="2" fill="hsl(25 90% 45%)" />
    </svg>
  );
}
