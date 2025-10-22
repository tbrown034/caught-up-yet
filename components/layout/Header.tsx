import React from "react";
import { SITE_CONFIG } from "@/constants/site";
import BrandIcon from "@/components/ui/BrandIcon";
import Button from "@/components/ui/Button";

const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <BrandIcon size={40} />
            <h1 className="text-2xl font-bold text-gray-900">
              {SITE_CONFIG.name}?
            </h1>
          </a>
          <nav className="flex gap-3 items-center">
            <a
              href="/"
              className="text-gray-700 hover:text-gray-900 transition-colors px-3 py-2"
            >
              Home
            </a>
            <a
              href="/about"
              className="text-gray-700 hover:text-gray-900 transition-colors px-3 py-2"
            >
              About
            </a>
            <Button variant="primary" size="sm" href="/signin" asLink>
              Sign In
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
