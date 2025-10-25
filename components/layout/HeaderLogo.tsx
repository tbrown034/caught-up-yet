import BrandIcon from "@/components/ui/BrandIcon";
import { SITE_CONFIG } from "@/constants/site";

export default function HeaderLogo() {
  return (
    <a
      href="/"
      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
    >
      <BrandIcon size={40} />
      <h1 className="text-2xl font-bold text-gray-900">{SITE_CONFIG.name}?</h1>
    </a>
  );
}
