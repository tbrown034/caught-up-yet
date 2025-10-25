import HeaderLogo from "@/components/layout/HeaderLogo";
import HeaderNav from "@/components/layout/HeaderNav";
import HeaderAuth from "@/components/layout/HeaderAuth";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <HeaderLogo />
          <div className="flex gap-3 items-center">
            <HeaderNav />
            <HeaderAuth />
          </div>
        </div>
      </div>
    </header>
  );
}
