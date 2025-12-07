interface BrandIconProps {
  size?: number;
  className?: string;
}

/**
 * Brand icon for Caught Up Yet?
 * A stylized "C" progress arc with a checkmark - represents "catching up" and completion
 */
export default function BrandIcon({
  size = 32,
  className = "",
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background with gradient */}
      <defs>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" fill="url(#brandGrad)" />

      {/* Stylized "C" progress arc */}
      <path
        d="M 340 140 A 140 140 0 1 0 340 372"
        stroke="white"
        strokeWidth="48"
        strokeLinecap="round"
        fill="none"
      />

      {/* Checkmark - "caught up" */}
      <path
        d="M 300 280 L 340 320 L 400 240"
        stroke="white"
        strokeWidth="40"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
