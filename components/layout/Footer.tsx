import { SITE_CONFIG } from "@/constants/site";
import { getCurrentYear } from "@/lib/utils";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            © {getCurrentYear()} {SITE_CONFIG.name} - {SITE_CONFIG.tagline}
          </div>
          <div className="flex gap-6">
            <a
              href="/about"
              className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
            >
              Privacy
            </a>
            <a
              href="/about"
              className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
            >
              Terms
            </a>
            <a
              href="/about"
              className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
