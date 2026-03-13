export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      
      <circle cx="24" cy="24" r="20" stroke="url(#solar-grad)" strokeWidth="2" opacity="0.3" />
      
      <rect x="14" y="14" width="8" height="8" rx="1.5" fill="url(#solar-grad)" opacity="0.9" />
      <rect x="26" y="14" width="8" height="8" rx="1.5" fill="url(#solar-grad)" opacity="0.7" />
      <rect x="14" y="26" width="8" height="8" rx="1.5" fill="url(#solar-grad)" opacity="0.7" />
      <rect x="26" y="26" width="8" height="8" rx="1.5" fill="url(#solar-grad)" opacity="0.5" />
     
      <circle cx="24" cy="10" r="2" fill="url(#solar-grad)" />
      <circle cx="38" cy="24" r="2" fill="url(#solar-grad)" />
      <circle cx="24" cy="38" r="2" fill="url(#solar-grad)" />
      <circle cx="10" cy="24" r="2" fill="url(#solar-grad)" />
      
      <line x1="24" y1="12" x2="24" y2="14" stroke="url(#solar-grad)" strokeWidth="1" opacity="0.5" />
      <line x1="36" y1="24" x2="34" y2="24" stroke="url(#solar-grad)" strokeWidth="1" opacity="0.5" />
      <line x1="24" y1="34" x2="24" y2="36" stroke="url(#solar-grad)" strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="24" x2="14" y2="24" stroke="url(#solar-grad)" strokeWidth="1" opacity="0.5" />
      <defs>
        <linearGradient id="solar-grad" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
