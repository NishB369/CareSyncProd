"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Rocket,
  Github,
  BookOpen,
  Play,
  Zap,
  ExternalLink,
  Mail,
  Linkedin,
  Globe,
  Award,
  ChevronRight,
} from "lucide-react";

export default function ProjectSubmissionLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [animatedElements, setAnimatedElements] = useState<Set<string>>(
    new Set()
  );
  const [statsVisible, setStatsVisible] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const navCardsRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimatedElements((prev) => new Set(prev).add(entry.target.id));
            if (entry.target.id === "hero") {
              setStatsVisible(true);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    if (navCardsRef.current) observer.observe(navCardsRef.current);
    if (highlightsRef.current) observer.observe(highlightsRef.current);
    if (aboutRef.current) observer.observe(aboutRef.current);

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const links = {
    liveDemo: "https://care-sync-prod.vercel.app/landingpage",
    github: "https://github.com/NishB369/CareSyncProd",
    documentation: "https://care-sync-prod.vercel.app/documentation",
    video: "https://youtu.be/jOoPzpE6Ytg?si=2VwFgA-TFd1ZJ51s",
    linkedin: "https://www.linkedin.com/in/nishchay-bhatia/",
    portfolio: "https://skipper-ui-portfolio.vercel.app/",
    email: "nishbcodes@gmail.com",
  };

  const developerInfo = {
    name: "Nishchay Bhatia",
    role: "Prod-Design Synced Dev",
    company: "Allo Health",
  };

  return (
    <div className="min-h-screen bg-white tracking-tighter">
      {/* Floating Action Button */}
      {scrolled && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-[#035670] text-white p-4 rounded-full shadow-2xl hover:bg-[#066885] hover:scale-110 transition-all duration-300 animate-fade-in-up cursor-pointer"
        >
          <ChevronRight size={24} className="-rotate-90" />
        </button>
      )}

      {/* Hero Section */}
      <section
        ref={heroRef}
        id="hero"
        className="relative pt-20 pb-16 lg:pb-20 overflow-hidden bg-gradient-to-br from-[#e6f2f5] via-white to-[#e6f2f5] px-20"
      >
        {/* Animated Background Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-[#035670]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#066885]/10 rounded-full blur-3xl animate-float"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* LEFT SIDE - Text Content */}
            <div className="space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 group animate-fade-in-up">
                <Award size={18} className="text-[#035670] animate-pulse" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-[#035670] transition-colors">
                  Task Submission for {developerInfo.company}
                </span>
              </div>

              {/* Main Heading */}
              <div className="animate-fade-in-up delay-100">
                <h1 className="text-5xl lg:text-6xl font-light leading-tight mb-4">
                  <span className="text-gray-900">Care</span>
                  <span className="font-semibold text-[#035670]">Sync</span>
                </h1>
                <p className="text-2xl lg:text-3xl text-gray-700 font-light">
                  Healthcare Front Desk Management System
                </p>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed animate-fade-in-up delay-200 mb-6">
                A comprehensive solution for streamlining healthcare operations.
                Built with Next.js, TypeScript, and modern web technologies.
              </p>

              {/* Stats Bar - Vertical Layout */}
              <div className="grid grid-cols-2 gap-4 animate-fade-in-up delay-300">
                {[
                  { icon: Zap, label: "Production Ready" },
                  { icon: BookOpen, label: "Fully Documented" },
                  { icon: Play, label: "Video Walkthrough" },
                  { icon: Github, label: "Open Source" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-gray-100"
                  >
                    <stat.icon
                      size={24}
                      className="text-[#035670] group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                    />
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#035670] transition-colors">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE - Video */}
            <div className="relative animate-fade-in-up delay-300">
              <div className="bg-white rounded-3xl shadow-xl p-4 border border-gray-100 hover:shadow-3xl transition-shadow duration-500">
                {/* Video Container */}
                <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video group">
                  <iframe
                    width="560"
                    height="315"
                    src="https://www.youtube.com/embed/jOoPzpE6Ytg?si=2VwFgA-TFd1ZJ51s"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Video Info */}
                <div className="mt-4 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#035670] to-[#066885] flex items-center justify-center">
                      <Play size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Project Walkthrough
                      </p>
                      <p className="text-sm text-gray-600">6:07 minutes</p>
                    </div>
                  </div>
                  <a
                    href={links.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#035670] hover:text-[#066885] transition-colors cursor-pointer"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-400 mt-8">
                <a
                  href="/landingpage"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#035670] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#066885] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden cursor-pointer"
                >
                  <span className="relative z-10">Launch Live App</span>
                  <Rocket
                    size={20}
                    className="relative z-10 group-hover:translate-x-1 transition-transform duration-300"
                  />
                  <span className="absolute inset-0 bg-gradient-to-r from-[#066885] to-[#035670] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Cards Section */}
      <section
        ref={navCardsRef}
        id="nav-cards"
        className="py-20 bg-white px-20"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light mb-4">
              <span className="text-gray-900">Explore the </span>
              <span className="font-semibold text-[#035670]">Project</span>
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to evaluate CareSync
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Rocket,
                title: "Live Demo",
                description:
                  "Experience the full application deployed on Vercel. Test all features including doctor management, appointment booking, and queue tracking.",
                link: links.liveDemo,
                buttonText: "Launch App",
                badge: "Production",
                color: "from-[#035670] to-cyan-600",
              },
              {
                icon: Github,
                title: "Source Code",
                description:
                  "Explore clean, well-structured code with comprehensive comments. Includes setup instructions and architecture decisions.",
                link: links.github,
                buttonText: "View Code",
                badge: "⭐ Star",
                color: "from-gray-700 to-gray-900",
              },
              {
                icon: BookOpen,
                title: "Documentation",
                description:
                  "Deep dive into system architecture, API endpoints, database schema, and deployment process. Perfect for technical evaluation.",
                link: links.documentation,
                buttonText: "Read Docs",
                badge: "Technical",
                color: "from-blue-600 to-blue-800",
              },
              {
                icon: Play,
                title: "Video Tour",
                description:
                  "5-minute guided tour showcasing key features, user flows, and technical implementations. See CareSync in action.",
                link: links.video,
                buttonText: "Watch Video",
                badge: "5:32",
                color: "from-red-600 to-red-800",
              },
            ].map((card, index) => (
              <div
                key={index}
                className={`group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#035670] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative overflow-hidden ${
                  animatedElements.has("nav-cards") ? "animate-fade-in-up" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-[#035670]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Badge */}
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-semibold text-[#035670] border border-[#035670]/20 group-hover:bg-[#035670] group-hover:text-white transition-all duration-300">
                  {card.badge}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10`}
                >
                  <card.icon size={32} className="text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-[#035670] transition-colors relative z-10">
                  {card.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 relative z-10">
                  {card.description}
                </p>

                {/* Button */}
                <a
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#035670] font-semibold hover:gap-3 transition-all duration-300 relative z-10 cursor-pointer"
                >
                  {card.buttonText}
                  <ExternalLink size={18} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Developer Section */}
      <section ref={aboutRef} id="about" className="py-20 bg-white px-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-light mb-4">
              <span className="text-gray-900">Crafted with </span>
              <span className="font-semibold text-[#035670]">Care</span>
            </h2>
            <p className="text-2xl text-gray-700 font-light">
              {developerInfo.name} | {developerInfo.role}
            </p>
          </div>

          <div
            className={`bg-gradient-to-br from-[#e6f2f5] to-white rounded-2xl p-8 lg:p-12 mb-12 ${
              animatedElements.has("about") ? "animate-fade-in-up" : ""
            }`}
          >
            <p className="text-xl text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              Passionate about building scalable healthcare solutions that
              improve patient care. This project demonstrates my commitment to
              clean code, user experience, and going beyond requirements to
              deliver production-ready applications.
            </p>
          </div>

          {/* Social Links */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">
              Let&lsquo;s Connect
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: Linkedin,
                  label: "LinkedIn",
                  link: links.linkedin,
                  color: "from-blue-600 to-blue-700",
                },
                {
                  icon: Github,
                  label: "GitHub",
                  link: links.github,
                  color: "from-gray-700 to-gray-900",
                },
                {
                  icon: Globe,
                  label: "Portfolio",
                  link: links.portfolio,
                  color: "from-[#035670] to-[#066885]",
                },
                {
                  icon: Mail,
                  label: "Email",
                  link: `mailto:${links.email}`,
                  color: "from-red-600 to-red-700",
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#035670] hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ${
                    animatedElements.has("about") ? "animate-fade-in-up" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${social.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <social.icon size={24} className="text-white" />
                  </div>
                  <div className="font-semibold text-gray-900 group-hover:text-[#035670] transition-colors">
                    {social.label}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 text-center animate-fade-in-up delay-400">
            <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
              <Award size={20} className="text-amber-700" />
              <span className="font-semibold text-amber-900">Please Note</span>
            </div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              This landing page is an additional deliverable—custom-built to
              showcase the project professionally and demonstrate my attention
              to detail, initiative, and commitment to quality work.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-6">
            <div className="text-3xl font-light">
              <span className="text-white">Care</span>
              <span className="font-semibold text-[#066885]">Sync</span>
            </div>
            <p className="text-lg">Healthcare Front Desk Management System</p>
            <p className="text-sm">
              Developed as a task submission for {developerInfo.company}
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-6 py-6">
              {[
                { label: "Live Demo", link: links.liveDemo },
                { label: "GitHub", link: links.github },
                { label: "Documentation", link: links.documentation },
                { label: "Video Tour", link: links.video },
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors relative group cursor-pointer"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>

            <div className="border-t border-gray-800 pt-6">
              <p className="text-sm">
                © 2025 {developerInfo.name} | All rights reserved
              </p>
              <p className="text-sm mt-2">
                Built with{" "}
                <span className="text-red-500 animate-pulse-slow">❤️</span>{" "}
                using Next.js and Tailwind CSS
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}
