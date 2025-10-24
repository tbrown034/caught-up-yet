import { CheckCircle } from "lucide-react";

interface BrandIconProps {
  size?: number;
  className?: string;
}

export default function BrandIcon({ size = 32, className = "" }: BrandIconProps) {
  return (
    <CheckCircle
      size={size}
      className={`text-blue-600 ${className}`}
    />
  );
}
