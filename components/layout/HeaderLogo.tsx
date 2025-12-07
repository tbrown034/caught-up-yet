import BrandIcon from "@/components/ui/BrandIcon";
import { SITE_CONFIG } from "@/constants/site";

export default function HeaderLogo() {
  return (
    <a
      href="/"
      className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
    >
      <BrandIcon size={36} />
      <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
        {SITE_CONFIG.name}<span className="text-blue-600 dark:text-blue-400">?</span>
      </span>
    </a>
  );
}
