import { ReactNode } from "react";

type BadgeVariant = "default" | "live" | "success" | "warning" | "error" | "sport";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
  pulse?: boolean;
}

export default function Badge({
  variant = "default",
  size = "sm",
  children,
  className = "",
  pulse = false,
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-semibold rounded uppercase";

  const variantStyles = {
    default: "bg-gray-100 text-gray-600",
    live: "bg-red-100 text-red-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-600",
    sport: "bg-gray-100 text-gray-500",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {pulse && (
        <span className="w-2 h-2 bg-current rounded-full animate-pulse mr-1.5" />
      )}
      {children}
    </span>
  );
}
