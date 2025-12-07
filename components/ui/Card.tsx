import { ReactNode } from "react";

type CardVariant = "default" | "interactive" | "muted" | "highlighted";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
}

export default function Card({
  variant = "default",
  padding = "md",
  children,
  className = "",
  as: Component = "div",
}: CardProps) {
  const baseStyles = "rounded-lg border";

  const variantStyles = {
    default: "bg-white border-gray-200",
    interactive:
      "bg-white border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer",
    muted: "bg-gray-50 border-gray-200",
    highlighted: "bg-blue-50 border-blue-200",
  };

  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </Component>
  );
}

// Sub-components for structured cards
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex justify-between items-center mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
