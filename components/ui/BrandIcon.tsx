import { IoCheckmarkCircle } from "react-icons/io5";

interface BrandIconProps {
  size?: number;
  className?: string;
}

export default function BrandIcon({ size = 32, className = "" }: BrandIconProps) {
  return (
    <IoCheckmarkCircle
      size={size}
      className={`text-blue-600 ${className}`}
    />
  );
}
