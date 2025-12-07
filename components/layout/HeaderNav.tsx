export default function HeaderNav() {
  return (
    <nav className="flex gap-1 items-center">
      <a
        href="/"
        className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Home
      </a>
      <a
        href="/about"
        className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        About
      </a>
    </nav>
  );
}
