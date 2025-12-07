import { SITE_CONFIG } from "@/constants/site";
import Button from "@/components/ui/Button";
import HowItWorksDemo from "@/components/about/HowItWorksDemo";
import {
  PlayIcon,
  LockClosedIcon,
  DocumentTextIcon,
  FingerPrintIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const sections = [
  { id: "how-it-works", label: "How It Works" },
  { id: "privacy", label: "Privacy" },
  { id: "terms", label: "Terms" },
  { id: "data", label: "Data & Cookies" },
  { id: "contact", label: "Contact" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            About {SITE_CONFIG.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {SITE_CONFIG.tagline}
          </p>
        </div>

        {/* Quick Nav */}
        <nav className="mb-12">
          <div className="flex flex-wrap justify-center gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
              >
                {section.label}
              </a>
            ))}
          </div>
        </nav>

        {/* How It Works - Interactive Demo */}
        <section id="how-it-works" className="mb-16 scroll-mt-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <PlayIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                How It Works
              </h2>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-3xl">
              Everyone in your watch party tracks their position in the game.
              Messages are tagged with the game moment they were sent.
              You only see messages from moments you've already watched.
            </p>

            <HowItWorksDemo />
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="mb-8 scroll-mt-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <LockClosedIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>We collect only what's needed to run the service:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Account info (email, name) when you sign in</li>
                <li>Watch party data and your game progress</li>
                <li>Basic analytics to improve the service</li>
              </ul>
              <p>
                We never sell your data. Your watch history is private and only
                shared with members of parties you join.
              </p>
            </div>
          </div>
        </section>

        {/* Terms */}
        <section id="terms" className="mb-8 scroll-mt-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Terms</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>By using {SITE_CONFIG.name}, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use the service for personal, non-commercial purposes</li>
                <li>Respect other users in your watch parties</li>
                <li>Not abuse or attempt to compromise the service</li>
              </ul>
              <p>We can suspend accounts that violate these terms.</p>
            </div>
          </div>
        </section>

        {/* Data & Cookies */}
        <section id="data" className="mb-8 scroll-mt-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FingerPrintIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data & Cookies</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              We use cookies and local storage to keep you logged in and save your
              preferences. When you sign in with Google or GitHub, you authorize us
              to access your basic profile info (name, email) from those services.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact</h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400 space-y-3">
              <p>Questions or feedback? Reach out anytime.</p>
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                  <p>
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {SITE_CONFIG.email}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Built by</span>
                  <p>
                    <a
                      href={SITE_CONFIG.developer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {SITE_CONFIG.developer.name}
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  href={`mailto:${SITE_CONFIG.email}`}
                  asLink
                >
                  Send Email
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  href={SITE_CONFIG.developer.website}
                  asLink
                >
                  Portfolio
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
