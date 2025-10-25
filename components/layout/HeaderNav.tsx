export default function HeaderNav() {
  return (
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
    </nav>
  );
}
