"use client";

import HeaderLogo from "@/components/layout/HeaderLogo";
import HeaderNav from "@/components/layout/HeaderNav";
import ClientHeaderAuth from "@/components/layout/ClientHeaderAuth";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function ClientHeader() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <HeaderLogo />
          <div className="flex gap-2 items-center">
            <HeaderNav />
            <ThemeToggle />
            <ClientHeaderAuth />
          </div>
        </div>
      </div>
    </header>
  );
}
