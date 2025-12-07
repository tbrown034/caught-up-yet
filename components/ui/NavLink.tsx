import Link from "next/link";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  active?: boolean;
}

export default function NavLink({
  href,
  children,
  className = "",
  active = false,
}: NavLinkProps) {
  const baseStyles =
    "text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-md";
  const activeStyles = active ? "text-blue-600 font-medium" : "";

  return (
    <Link href={href} className={`${baseStyles} ${activeStyles} ${className}`}>
      {children}
    </Link>
  );
}
