"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "./Button";

interface AuthAwareButtonProps {
  authenticatedHref: string;
  unauthenticatedHref: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function AuthAwareButton({
  authenticatedHref,
  unauthenticatedHref,
  children,
  variant = "primary",
  size = "lg",
}: AuthAwareButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkAuth();
  }, [supabase.auth]);

  // Show loading state or default to unauthenticated
  const href =
    isAuthenticated === null
      ? unauthenticatedHref
      : isAuthenticated
        ? authenticatedHref
        : unauthenticatedHref;

  return (
    <Button variant={variant} size={size} href={href} asLink>
      {children}
    </Button>
  );
}
