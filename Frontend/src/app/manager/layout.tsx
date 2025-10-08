"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Users,
  ClipboardClock,
  TextWrap,
} from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [_hoveredItem, setHoveredItem] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  const handleNavigationClick = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
    if (!isSidebarExpanded) setIsSidebarExpanded(true);
  };

  const menuItems = [
    { id: "home", label: "Home", icon: House, href: "/manager/home" },
    {
      id: "doctors",
      label: "Manage Doctors",
      icon: Users,
      href: "/manager/doctors",
    },
    {
      id: "appointments",
      label: "Manage Appointments",
      icon: ClipboardClock,
      href: "/manager/appointments",
    },
    {
      id: "queue",
      label: "Patient Queue",
      icon: TextWrap,
      href: "/manager/queue",
    },
    {
      id: "help",
      label: "Help",
      icon: HelpCircle,
      href: "/manager/help",
    },
  ];

  const getActiveSection = () => {
    if (pathname.includes("/doctors")) return "doctors";
    if (pathname.includes("/appointments")) return "appointments";
    if (pathname.includes("/queue")) return "queue";
    if (pathname.includes("/help")) return "help";
    return "home";
  };

  const activeSection = getActiveSection();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login/manager");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("mobile-sidebar");
      const button = document.getElementById("mobile-menu-button");
      if (
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        button &&
        !button.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Toggle */}
      <button
        id="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-white text-gray-700 rounded-xl border-2 border-gray-00 shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="mobile-sidebar"
        className={`${
          isMobileMenuOpen
            ? "fixed inset-y-0 left-0 z-50 lg:sticky"
            : "hidden lg:flex"
        } ${
          isSidebarExpanded ? "w-64" : "w-20"
        } h-screen bg-white border-r border-gray-400 flex flex-col transition-all duration-300 ease-in-out shadow-lg `}
      >
        {/* Top: Logo + Toggle */}
        <div className="p-5 border-b border-gray-400 flex items-center justify-between">
          {isSidebarExpanded ? (
            <>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                CareSync
              </span>

              <button
                onClick={() => {
                  if (isMobileMenuOpen) {
                    setIsMobileMenuOpen(false);
                  } else {
                    setIsSidebarExpanded(!isSidebarExpanded);
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4 w-full">
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 pt-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <div key={item.id} className="relative">
                <button
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleNavigationClick(item.href)}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-lg transition-all duration-200 cursor-pointer tracking-tight group ${
                    isActive
                      ? "bg-[#035670] text-white font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${!isSidebarExpanded ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 group-hover:scale-110 duration-200 ease-in-out"
                    }`}
                  />
                  {isSidebarExpanded && (
                    <span className="text-sm whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-400">
          <button
            onClick={handleLogout}
            className={`group w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl bg-red-50 text-red-600 transition-all duration-200 cursor-pointer ${
              !isSidebarExpanded ? "justify-center px-0" : ""
            }`}
          >
            <LogOut
              className={`w-5 h-5 flex-shrink-0 duration-200 ease-in-out ${
                isSidebarExpanded ? "group-hover:mr-4" : "group-hover:scale-110"
              }`}
            />
            {isSidebarExpanded && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 ease-in-out">
        <div className="p-4 lg:p-8 overflow-y-scroll max-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
