interface NeighborhoodGridLogoProps {
  className?: string;
  size?: number;
}

export function NeighborhoodGridLogo({ className = "", size = 32 }: NeighborhoodGridLogoProps) {
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
      <rect x="4" y="4" width="12" height="12" rx="2" fill="hsl(var(--primary))" />
      <rect x="18" y="4" width="12" height="12" rx="2" fill="hsl(var(--primary))" opacity="0.7" />
      <rect x="32" y="4" width="12" height="12" rx="2" fill="hsl(var(--accent))" />
      
      <rect x="4" y="18" width="12" height="12" rx="2" fill="hsl(var(--primary))" opacity="0.7" />
      <rect x="18" y="18" width="12" height="12" rx="2" fill="hsl(var(--accent))" opacity="0.8" />
      <rect x="32" y="18" width="12" height="12" rx="2" fill="hsl(var(--primary))" opacity="0.7" />
      
      <rect x="4" y="32" width="12" height="12" rx="2" fill="hsl(var(--accent))" opacity="0.6" />
      <rect x="18" y="32" width="12" height="12" rx="2" fill="hsl(var(--primary))" opacity="0.7" />
      <rect x="32" y="32" width="12" height="12" rx="2" fill="hsl(var(--primary))" />
    </svg>
  );
}
