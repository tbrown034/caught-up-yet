import { SITE_CONFIG } from "@/constants/site";
import Button from "@/components/ui/Button";

const sections = [
  { id: "mission", label: "Our Mission" },
  { id: "how-it-works", label: "How It Works" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Service" },
  { id: "data-cookies", label: "Data & Cookies" },
  { id: "contact", label: "Contact" },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Mobile Horizontal Navigation */}
      <nav className="lg:hidden mb-8">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Quick Navigation
          </h2>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-700 border border-gray-200 rounded-md transition-all shadow-sm"
              >
                {section.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="flex gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="sticky top-20">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                On This Page
              </h2>
              <div className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    {section.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl lg:max-w-none">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              About {SITE_CONFIG.name}
            </h1>
            <p className="text-lg text-gray-600">{SITE_CONFIG.tagline}</p>
          </div>

          <div className="prose prose-lg max-w-none">
        <section id="mission" className="mb-12 scroll-mt-20">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">🎯</span> Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Watch games together without the fear of spoilers. {SITE_CONFIG.name}{" "}
              helps you sync up with friends and family to enjoy sports and events
              at your own pace, ensuring everyone stays on the same page without
              ruining the excitement.
            </p>
          </div>
        </section>

        <section id="how-it-works" className="mb-12 scroll-mt-20">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">⚡</span> How It Works
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Create a watch party, invite your friends, and everyone can track
              their progress through the game. No more accidental spoilers in the
              group chat. No more missing out on shared reactions. Just pure,
              synchronized enjoyment.
            </p>
          </div>
        </section>

        <section id="privacy" className="mb-12 scroll-mt-20">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">🔒</span> Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your privacy is important to us. When you use {SITE_CONFIG.name}, we
              collect and store only the information necessary to provide our
              service:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Account information (email, name) when you sign up via OAuth</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Watch party data and progress tracking</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Basic usage analytics to improve the service</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We never sell your data to third parties. Your watch history is
              private and only shared with members of watch parties you explicitly
              join.
            </p>
          </div>
        </section>

        <section id="terms" className="mb-12 scroll-mt-20">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">📋</span> Terms of Service
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By using {SITE_CONFIG.name}, you agree to:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Use the service for personal, non-commercial purposes</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Not share spoilers outside of the agreed watch party timeline</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Respect other users and maintain a friendly community</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 mt-1">•</span>
                <span>Not attempt to abuse, hack, or compromise the service</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend accounts that violate these terms.
            </p>
          </div>
        </section>

        <section id="data-cookies" className="mb-12 scroll-mt-20">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">🍪</span> Data & Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and local storage to keep you logged in and remember
              your preferences. By signing in with OAuth providers (Google, GitHub,
              etc.), you authorize us to access your basic profile information
              (name, email) as provided by those services.
            </p>
          </div>
        </section>

        <section id="contact" className="mb-12 scroll-mt-20">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">✉️</span> Contact
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Questions, feedback, or concerns? Reach out anytime.
            </p>
            <div className="space-y-4">
              <p className="text-gray-700">
                <span className="font-medium">Email:</span>{" "}
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {SITE_CONFIG.email}
                </a>
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Built by:</span>{" "}
                <a
                  href={SITE_CONFIG.developer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {SITE_CONFIG.developer.name}
                </a>
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="primary" size="sm" href={`mailto:${SITE_CONFIG.email}`} asLink>
                  Send Email
                </Button>
                <Button variant="ghost" size="sm" href={SITE_CONFIG.developer.website} asLink>
                  View Portfolio
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
        </div>
      </div>
    </div>
  );
}
