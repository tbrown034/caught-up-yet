"use client";

import { SITE_CONFIG } from "@/constants/site";
import Button from "@/components/ui/Button";
import {
  Heart,
  Users,
  Shield,
  Zap,
  Clock,
  MessageCircle,
  Code,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  Lock,
  FileText,
  Cookie,
  Lightbulb,
  Target,
  TrendingUp,
  Globe,
} from "lucide-react";
import { useState } from "react";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "cookies">(
    "privacy"
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the spoiler protection actually work?",
      answer:
        "Every message in a watch party is timestamped based on when it was sent during the game. When you join and update your progress, you only see messages from moments you've already watched. It's like a time-locked group chat that reveals itself as you progress through the game.",
    },
    {
      question: "What if I'm watching a replay days after the game?",
      answer:
        "Perfect! That's exactly what Caught Up Yet? was built for. You can join a watch party for a game that already finished, update your progress as you watch the replay, and see all the reactions from your friends who watched live—but only as you reach those moments yourself.",
    },
    {
      question: "Can I use this for any sport?",
      answer:
        "Currently, we support NFL, NBA, MLB, and NHL games with live data integration from ESPN. We're constantly working to add more sports and events based on user feedback.",
    },
    {
      question: "Is it really free?",
      answer:
        "Yes! Caught Up Yet? is free for small groups and families. Our mission is to bring back the shared sports-watching experience, and we believe that shouldn't cost you anything for personal use with your loved ones.",
    },
    {
      question: "What if someone in my watch party spoils the game anyway?",
      answer:
        "The system is designed to prevent accidental spoilers by only revealing messages when you reach that point in the game. However, we trust our users to respect the spirit of the platform. If someone intentionally tries to spoil, you can always remove them from your watch party.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-500/30 backdrop-blur-sm border border-blue-400/30 text-blue-100 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Heart className="w-4 h-4" />
              <span>Built with Love for Sports Fans</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              About {SITE_CONFIG.name}
            </h1>

            <p className="text-xl sm:text-2xl text-blue-100 mb-8 leading-relaxed">
              {SITE_CONFIG.tagline}
            </p>

            <p className="text-lg text-blue-200 leading-relaxed max-w-3xl mx-auto">
              We're on a mission to bring back the magic of watching sports
              together—even when life means you can't all watch at the same
              time. Because the best part of sports isn't just the game, it's
              sharing those moments with the people you care about.
            </p>
          </div>
        </div>
      </section>

      {/* The Journey: Problem → Solution */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every great solution starts with a problem that hits home
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 relative">
            {/* Problem */}
            <div className="relative">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 h-full hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <MessageCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  The Problem
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You're watching the game on DVR delay. Your dad's watching
                  live across the country. Your sister's catching the replay
                  tomorrow.
                </p>
                <p className="text-gray-700 leading-relaxed font-semibold">
                  The group chat is silent. The shared experience is lost.
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ChevronDown className="w-8 h-8 text-blue-600 rotate-[-90deg]" />
              </div>
            </div>

            {/* Idea */}
            <div className="relative">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 h-full hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Lightbulb className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  The Idea
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  What if there was a group chat that knew where everyone was in
                  the game?
                </p>
                <p className="text-gray-700 leading-relaxed font-semibold">
                  Messages would only appear when you reached that exact moment.
                  No spoilers. All the fun.
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ChevronDown className="w-8 h-8 text-blue-600 rotate-[-90deg]" />
              </div>
            </div>

            {/* Solution */}
            <div className="relative">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 h-full hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  The Solution
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Caught Up Yet? brings the magic back. Watch on your schedule,
                  share every reaction, and never miss a moment.
                </p>
                <p className="text-gray-700 leading-relaxed font-semibold">
                  It's like watching together on the couch—even when you're not.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Real People
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Creating meaningful connections through shared sports experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-gray-600 font-medium">
                Spoiler Protection
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Zero accidental spoilers
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                Unlimited
              </div>
              <div className="text-gray-600 font-medium">Watch Parties</div>
              <p className="text-sm text-gray-500 mt-2">
                Free for small groups
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">4</div>
              <div className="text-gray-600 font-medium">Major Sports</div>
              <p className="text-sm text-gray-500 mt-2">
                NFL, NBA, MLB, NHL
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">Live</div>
              <div className="text-gray-600 font-medium">Game Data</div>
              <p className="text-sm text-gray-500 mt-2">
                Real-time ESPN integration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Really Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Really Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The technology behind spoiler-free watch parties
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Live Game Integration
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    We sync with ESPN's live game data to track every play,
                    quarter, and moment in real-time. This creates a precise
                    timeline for the entire game.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Smart Timestamping
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    When someone sends a message, we automatically tag it with
                    the exact game moment—quarter, time remaining, and play
                    number. No manual input needed.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Progressive Reveal
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    As you update your progress, messages unlock in perfect
                    chronological order. You see reactions from moments you've
                    already watched, but nothing from ahead.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Shared Experience
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Even though you're watching at different times, you get to
                    experience everyone's reactions together. It's the best of
                    both worlds.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Dad (Watching Live - Q4, 2:30)
                      </p>
                      <p className="text-gray-700">
                        "TOUCHDOWN! What a catch! 🏈"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-4 border-2 border-dashed border-blue-300 opacity-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 mb-1">
                        Sister (Watching Tomorrow)
                      </p>
                      <p className="text-gray-400 italic">
                        Message locked until you reach Q4, 2:30
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        You (DVR Delay - Q3, 5:45)
                      </p>
                      <p className="text-gray-700">
                        "Great defense on that play!"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600 font-medium">
                    ✨ Everyone watches at their own pace, sees reactions as
                    they go
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Story Behind It */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Target className="w-16 h-16 mx-auto mb-6 text-blue-200" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Why We Built This
              </h2>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-white/20">
              <div className="prose prose-lg max-w-none">
                <p className="text-blue-100 leading-relaxed text-lg mb-6">
                  Sports have always been about bringing people together. The
                  roar of the crowd, the shared gasps, the high-fives after a
                  big play—these moments are what make watching games special.
                </p>
                <p className="text-blue-100 leading-relaxed text-lg mb-6">
                  But modern life pulled us apart. Time zones, work schedules,
                  kids' bedtimes, DVR recordings—suddenly, watching "together"
                  meant staying silent in group chats to avoid spoilers. The
                  shared experience was lost.
                </p>
                <p className="text-white leading-relaxed text-lg font-semibold mb-6">
                  We built Caught Up Yet? because we believe technology should
                  bring people together, not keep them apart.
                </p>
                <p className="text-blue-100 leading-relaxed text-lg">
                  Whether it's a dad on the East Coast watching live, his son on
                  the West Coast on DVR delay, or his daughter catching the
                  replay the next day—everyone should get to share those
                  moments. That's what sports are really about.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Spotlight */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Meet the Developer
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with passion by a developer who loves sports and bringing
              people together
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 lg:p-12 border-2 border-gray-200 shadow-xl">
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                    {SITE_CONFIG.developer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {SITE_CONFIG.developer.name}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Full-Stack Developer & Sports Enthusiast
                  </p>

                  <p className="text-gray-700 leading-relaxed mb-6">
                    Hey there! I'm Trevor, and I built Caught Up Yet? because I
                    was tired of missing out on game day conversations with my
                    family. As a developer, I knew there had to be a better
                    way—so I built it. This project combines my love for
                    building useful tools with my passion for bringing people
                    together through sports.
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                    <a
                      href={SITE_CONFIG.developer.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors shadow-sm"
                    >
                      <Github className="w-4 h-4" />
                      <span className="font-medium">GitHub</span>
                    </a>
                    <a
                      href={SITE_CONFIG.developer.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span className="font-medium">LinkedIn</span>
                    </a>
                    <a
                      href={SITE_CONFIG.developer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="font-medium">Portfolio</span>
                    </a>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Code className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Tech Stack:</span>
                      <span>Next.js, React, TypeScript, Tailwind CSS, Supabase</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about Caught Up Yet?
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openFaq === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Legal Tabs */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Privacy & Legal
            </h2>
            <p className="text-lg text-gray-600">
              We take your privacy seriously and want you to know exactly how we
              operate
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setActiveTab("privacy")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "privacy"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "terms"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab("cookies")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "cookies"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Cookie className="w-4 h-4 inline mr-2" />
              Data & Cookies
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200">
            {activeTab === "privacy" && (
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Privacy Policy
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      What We Collect
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Account Information:</strong> Email and name
                          when you sign up via OAuth (Google, GitHub, etc.)
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Watch Party Data:</strong> Games you create or
                          join, your progress, and messages you send
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Usage Analytics:</strong> Basic analytics to
                          improve the service (pages visited, features used)
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      What We Don't Do
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>We never sell your data</strong> to third
                          parties or advertisers
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>We don't share your watch history</strong>{" "}
                          except with watch party members you explicitly join
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>We don't track you</strong> across other
                          websites or apps
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">
                        Your data is yours.
                      </strong>{" "}
                      You can request a copy of your data or delete your account
                      at any time by contacting us at{" "}
                      <a
                        href={`mailto:${SITE_CONFIG.email}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {SITE_CONFIG.email}
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Terms of Service
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      By using Caught Up Yet?, you agree to:
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Personal Use:</strong> Use the service for
                          personal, non-commercial purposes with friends and
                          family
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Respect the Spirit:</strong> Don't share
                          spoilers outside of the agreed watch party timeline
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Be Kind:</strong> Respect other users and
                          maintain a friendly, inclusive community
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Play Fair:</strong> Don't attempt to abuse,
                          hack, reverse engineer, or compromise the service
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Age Requirement:</strong> You must be at least
                          13 years old to use the service
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Our Commitments to You
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-gray-700">
                        <Heart className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          We'll do our best to keep the service running smoothly
                          and reliably
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <Heart className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          We'll notify you of any major changes to these terms
                          or our service
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <Heart className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          We'll be transparent about how we use your data and
                          protect your privacy
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">Important:</strong> We
                      reserve the right to suspend or terminate accounts that
                      violate these terms. But we're reasonable people—if
                      there's an issue, we'll try to work it out first.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cookies" && (
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Data & Cookies
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      How We Use Cookies
                    </h4>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We use cookies and local storage to provide a better
                      experience. Here's exactly what we store:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-gray-700">
                        <Cookie className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Authentication Cookies:</strong> Keep you
                          logged in securely between sessions
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <Cookie className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Preferences:</strong> Remember your settings
                          and preferences
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <Cookie className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Session Data:</strong> Temporary data to make
                          the app work smoothly
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      OAuth & Third-Party Services
                    </h4>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      When you sign in with OAuth providers (Google, GitHub,
                      etc.), you authorize us to access:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Your basic profile information (name, email)</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Your profile picture (if available)</span>
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      We <strong>never</strong> access your emails, contacts, or
                      other private data from these services. We only use what's
                      necessary to create your account and personalize your
                      experience.
                    </p>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">
                        Minimal Data Collection:
                      </strong>{" "}
                      We believe in collecting only what's necessary. No
                      tracking pixels, no third-party advertising cookies, no
                      data mining. Just what we need to make the service work.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="w-16 h-16 mx-auto mb-6 text-blue-200" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Get in Touch
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Questions, feedback, or just want to say hi? We'd love to hear from
            you. Seriously—every message gets read and replied to.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-white">
                <Mail className="w-5 h-5 text-blue-200" />
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="text-lg hover:text-blue-200 transition-colors underline"
                >
                  {SITE_CONFIG.email}
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              href={`mailto:${SITE_CONFIG.email}`}
              asLink
            >
              <Mail className="w-5 h-5 mr-2" />
              Send Us an Email
            </Button>
            <Button
              variant="ghost"
              size="lg"
              href={SITE_CONFIG.developer.website}
              asLink
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View Developer Portfolio
            </Button>
          </div>

          <p className="text-blue-200 text-sm mt-8">
            Typical response time: Within 24 hours
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-12 border-2 border-blue-200">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Ready to Watch Without Spoilers?
            </h2>
            <p className="text-xl text-gray-700 mb-10">
              Join families and friends who are already enjoying sports
              together—on their own time.
            </p>
            <Button variant="primary" size="lg" href="/login" asLink>
              Get Started Free
            </Button>
            <p className="text-sm text-gray-600 mt-6">
              No credit card required • Free for small groups • Takes 30 seconds
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
