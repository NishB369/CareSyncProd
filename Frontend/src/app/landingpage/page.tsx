"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Users,
  Clock,
  BarChart3,
  CheckCircle,
  Menu,
  X,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CareSync() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animatedElements, setAnimatedElements] = useState<Set<string>>(
    new Set()
  );

  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);

  const toDashboard = () => {
    router.push("/auth/login/manager");
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimatedElements((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);
    if (benefitsRef.current) observer.observe(benefitsRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white tracking-tighter">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/50 backdrop-blur-md shadow-lg sm:px-20"
            : "bg-white/90 backdrop-blur-sm sm:px-10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-light">
              <span className="text-gray-900">Care</span>
              <span className="font-semibold text-[#035670]">Sync</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-900 hover:text-[#035670] transition-colors text-sm font-medium relative group cursor-pointer"
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#035670] transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-900 hover:text-[#035670] transition-colors text-sm font-medium relative group cursor-pointer"
              >
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#035670] transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="text-gray-900 hover:text-[#035670] transition-colors text-sm font-medium relative group cursor-pointer"
              >
                Benefits
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#035670] transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                className="bg-[#035670] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#066885] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 relative overflow-hidden group cursor-pointer"
                onClick={toDashboard}
              >
                <span className="relative z-10">Get Started</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#066885] to-[#035670] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-900 hover:text-[#035670] transition-colors cursor-pointer"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-6 py-4 space-y-3">
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left py-2 text-gray-900 hover:text-[#035670] transition-colors relative pl-2 group cursor-pointer"
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0.5 bg-[#035670] transition-all duration-300 group-hover:w-4"></span>
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block w-full text-left py-2 text-gray-900 hover:text-[#035670] transition-colors relative pl-2 group cursor-pointer"
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0.5 bg-[#035670] transition-all duration-300 group-hover:w-4"></span>
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="block w-full text-left py-2 text-gray-900 hover:text-[#035670] transition-colors relative pl-2 group cursor-pointer"
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0.5 bg-[#035670] transition-all duration-300 group-hover:w-4"></span>
                Benefits
              </button>
              <button
                className="w-full bg-[#035670] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#066885] transition-colors relative overflow-hidden group cursor-pointer"
                onClick={toDashboard}
              >
                <span className="relative z-10">Get Started</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#066885] to-[#035670] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        id="hero"
        className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-[#e6f2f5] via-white to-[#e6f2f5] sm:px-20"
      >
        {/* Animated Decorative Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-[#035670]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#066885]/10 rounded-full blur-3xl animate-float"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300 group">
                <Zap size={16} className="text-[#035670] animate-pulse" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#035670] transition-colors">
                  Transform Your Healthcare Operations
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-light leading-12">
                <span className="text-gray-900">Exceptional Care,</span>
                <br />
                <span className="font-semibold text-[#035670] animate-fade-in-up">
                  Every Time
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-xl animate-fade-in-up delay-100">
                Streamline your healthcare front desk operations with doctors
                management, appointment scheduling, queue management, and
                analytics.
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-600 animate-fade-in-up delay-200">
                <div className="flex -space-x-1 group">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-[#035670] border-2 border-white flex items-center justify-center text-white font-semibold animate-float"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {i === 1 ? "A" : i === 2 ? "B" : i === 3 ? "C" : "D"}
                    </div>
                  ))}
                </div>
                <span className="font-semibold text-gray-900 group-hover:text-[#035670] transition-colors">
                  1K+
                </span>{" "}
                Healthcare Professionals Trust Us
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                <button
                  className="bg-[#035670] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#066885] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden cursor-pointer"
                  onClick={toDashboard}
                >
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight
                    size={20}
                    className="relative z-10 group-hover:translate-x-1 transition-transform duration-300"
                  />
                  <span className="absolute inset-0 bg-gradient-to-r from-[#066885] to-[#035670] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="border-2 border-[#035670] text-[#035670] px-8 py-4 rounded-xl font-semibold hover:bg-[#035670] hover:text-white transition-all duration-300 group relative cursor-pointer"
                >
                  <span className="relative z-10">Learn More</span>
                  <span className="absolute inset-0 bg-[#035670] opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></span>
                </button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative animate-fade-in-right delay-300">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-shadow duration-500">
                {/* Doctor Card */}
                <div className="bg-gradient-to-br from-[#035670] to-[#066885] rounded-2xl p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors duration-300 animate-pulse-slow"></div>
                    <div
                      className="w-3 h-3 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors duration-300 animate-pulse-slow"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors duration-300 animate-pulse-slow"
                      style={{ animationDelay: "1s" }}
                    ></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6 group">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 animate-float">
                        DC
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-emerald-200 transition-colors">
                          Dr. Cameron Charles
                        </h3>
                        <p className="text-white/80 text-sm">
                          General Physician
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 group-hover:bg-white/20 transition-colors duration-300">
                        <div className="text-3xl font-bold">250+</div>
                        <div className="text-white/80 text-sm mt-1">
                          Appointments
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 group-hover:bg-white/20 transition-colors duration-300">
                        <div className="text-3xl font-bold">4.9</div>
                        <div className="text-white/80 text-sm mt-1">Rating</div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative circles */}
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500 animate-float"></div>
                  <div
                    className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500 animate-float"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300 group">
                    <div className="text-emerald-600 font-semibold text-2xl group-hover:text-emerald-700 transition-colors">
                      98%
                    </div>
                    <div className="text-emerald-700 text-sm mt-1 group-hover:text-emerald-800 transition-colors">
                      On-Time Rate
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group">
                    <div className="text-blue-600 font-semibold text-2xl group-hover:text-blue-700 transition-colors">
                      5 min
                    </div>
                    <div className="text-blue-700 text-sm mt-1 group-hover:text-blue-800 transition-colors">
                      Avg Wait Time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        id="features"
        className="py-20 bg-white sm:px-20"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light mb-4">
              <span className="text-gray-900">Powerful Features for</span>
              <span className="font-semibold text-[#035670]">
                {" "}
                Modern Healthcare
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to digitize and optimize your front desk
              operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: "Doctor Management",
                description:
                  "Efficiently manage doctor profiles, specializations, and availability schedules in one centralized system.",
                color: "from-[#035670] to-cyan-600",
              },
              {
                icon: Calendar,
                title: "Smart Appointments",
                description:
                  "Booking system that prevents conflicts and easens the manual hassle of checking calendars.",
                color: "from-[#035670] to-cyan-600",
              },
              {
                icon: Clock,
                title: "Queue Management",
                description:
                  "Ease of queue tracking for enhance patient experience and operators porductivity optimzation.",
                color: "from-[#035670] to-cyan-600",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description:
                  "Comprehensive insights into appointments, wait times, and operational efficiency metrics.",
                color: "from-[#035670] to-cyan-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group bg-white border border-gray-400 rounded-2xl p-6 hover:-translate-y-2 hover:shadow-2xl hover:border-[#035670] transition-all duration-300 relative overflow-hidden ${
                  animatedElements.has("features") ? "animate-fade-in-up" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-[#035670]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10`}
                >
                  <feature.icon
                    size={28}
                    className="text-white group-hover:rotate-12 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#035670] transition-colors relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed relative z-10">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[#e6f2f5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light mb-4">
              <span className="font-semibold text-[#035670]">How It Works</span>
            </h2>
            <p className="text-xl text-gray-600">
              Get started in four simple steps
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {[
              {
                title: "Add Your Doctors",
                desc: "Create profiles for all healthcare providers with their specializations and working hours.",
              },
              {
                title: "Configure Time Slots",
                desc: "Set up flexible appointment durations and break times for optimal scheduling.",
              },
              {
                title: "Book Appointments",
                desc: "Patients can book appointments instantly with real-time availability checking.",
              },
              {
                title: "Manage Queue",
                desc: "Track patient flow in real-time and manage the waiting queue efficiently.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-6 group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex-shrink-0 w-16 h-16 bg-[#035670] text-white rounded-xl flex items-center justify-center text-2xl font-bold group-hover:bg-[#066885] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg relative z-10">
                  {index + 1}
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 group-hover:shadow-xl transition-shadow duration-300 border border-transparent group-hover:border-[#035670]/30">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#035670] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        ref={benefitsRef}
        id="benefits"
        className="py-32 bg-white sm:px-40"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light mb-4">
              <span className="text-gray-900">Why Choose</span>
              <span className="font-semibold text-[#035670]"> CareSync?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Reduce patient wait times by up to 60%",
              "Eliminate double-booking and scheduling conflicts",
              "Improve staff productivity and efficiency",
              "Real-time queue visibility for patients",
              "Comprehensive analytics and reporting",
              "Easy integration with existing systems",
            ].map((benefit, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-xl border border-gray-400 hover:bg-[#e6f2f5] transition-colors duration-300 group cursor-pointer ${
                  animatedElements.has("benefits") ? "animate-fade-in-up" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle
                  size={24}
                  className="text-[#035670] flex-shrink-0 group-hover:scale-125 group-hover:text-emerald-600 transition-all duration-300 animate-pulse-slow"
                  style={{ animationDelay: `${index * 0.2}s` }}
                />
                <span className="text-lg text-gray-900 group-hover:text-[#035670] transition-colors">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        id="cta"
        className="relative py-20 overflow-hidden bg-gradient-to-br from-[#035670] via-[#066885] to-[#035670] sm:px-20"
      >
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-semibold text-white mb-6">
            Ready to Transform Your Front Desk?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join thousands of healthcare facilities already using CareSync
          </p>
          <button
            className="bg-white text-[#035670] px-10 py-4 rounded-xl font-semibold hover:bg-gray-100 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 text-lg relative overflow-hidden group cursor-pointer"
            onClick={toDashboard}
          >
            <span className="relative z-10">Continue to CareSync</span>
            <span className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 sm:px-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-light mb-4">
                <span className="text-white">Care</span>
                <span className="font-semibold text-[#066885]">Sync</span>
              </div>
              <p className="text-sm">
                Digitizing healthcare front desk operations for better patient
                care.
              </p>
            </div>

            <div className="hidden sm:block">
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors relative group inline-block"
                  >
                    Features
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors relative group inline-block"
                  >
                    Pricing
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors relative group inline-block"
                  >
                    Demo
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="hidden sm:block">
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors relative group inline-block"
                  >
                    About Us
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors relative group inline-block"
                  >
                    Contact
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors relative group inline-block"
                  >
                    Careers
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="hidden sm:block">
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors relative group inline-block"
                  >
                    Privacy Policy
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors relative group inline-block"
                  >
                    Terms of Service
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-3 sm:hidden">
              <div>
                <h3 className="text-white font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors relative group inline-block"
                    >
                      Features
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors relative group inline-block"
                    >
                      Pricing
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors relative group inline-block"
                    >
                      Demo
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors relative group inline-block"
                    >
                      About Us
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors relative group inline-block"
                    >
                      Contact
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors relative group inline-block"
                    >
                      Careers
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors relative group inline-block"
                    >
                      Privacy Policy
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-white transition-colors relative group inline-block"
                    >
                      Terms of Service
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 CareSync. All rights reserved.</p>
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

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out forwards;
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
      `}</style>
    </div>
  );
}
