"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Loader, Copy, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const testEmail = "care@sync.com";
  const testPassword = "qwerty123";

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(validateEmail(value) || value === "");
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      console.log("✅ Login successful");

      // ADD THIS DELAY - Wait for cookie to be set properly
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 1 second delay

      console.log("🍪 Cookies after delay:", document.cookie);

      router.push("/manager/doctors");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setIsEmailValid(false);
      setError("Please enter a valid email address.");
      return;
    }
    handleLogin();
  };

  useEffect(() => {
    if (isMounted && formRef.current) {
      const emailInput = formRef.current.querySelector(
        'input[type="email"]'
      ) as HTMLInputElement;
      emailInput?.focus();
    }
  }, [isMounted]);

  // Copy credentials to clipboard
  const copyCredentials = async () => {
    const text = `Email: ${testEmail}\nPassword: ${testPassword}`;
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Typewriter animation for auto-fill
  const typeText = (
    text: string,
    setter: (val: string) => void,
    delay = 50
  ) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setter(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, delay);
  };

  const autoFillCredentials = () => {
    setEmail("");
    setPassword("");
    setIsEmailValid(true);
    if (error) setError(null);

    // Type email
    typeText(testEmail, setEmail, 60);
    // Type password with slight delay
    setTimeout(() => {
      typeText(testPassword, setPassword, 60);
    }, 300);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center px-60 py-32 relative">
      <div
        className="absolute inset-0 opacity-5 -z-50"
        style={{
          backgroundImage: `
                linear-gradient(to right, #035670 1px, transparent 1px),
                linear-gradient(to bottom, #035670 1px, transparent 1px)
              `,
          backgroundSize: "30px 30px",
        }}
      />
      <div className="border-2 rounded-lg w-full h-full shadow-xl flex items-center justify-center overflow-hidden bg-white">
        {/* Left Panel - Doctor Image */}
        <div className="w-[50%] bg-[#035670] border-r rounded-r-full h-full relative overflow-hidden">
          <Image
            src="/media/FemaleDoctor.png"
            width={100}
            height={100}
            alt="Female Doctor"
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90%] transition-all duration-700"
          />
        </div>

        {/* Right Panel - Login Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-[50%] h-full py-10 px-10 flex flex-col gap-6 relative overflow-hidden"
        >
          <div className="w-full h-full flex flex-col gap-2 animate-fade-in-up relative z-10">
            <h1 className="text-3xl leading-[1] tracking-tighter font-light">
              Welcome back to <br />
              <span className="font-medium">CareSync</span>
            </h1>
            <h2 className="tracking-tighter font-extralight text-gray-600">
              Your trusted digital front desk.
            </h2>
          </div>

          <div className="w-full h-full flex flex-col gap-4 pr-10 relative z-10">
            <div className="animate-fade-in-up delay-100">
              <label
                htmlFor="email"
                className="block tracking-tighter font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your you@clinic.com"
                  className={`w-full border rounded-md p-2 mt-1 text-sm bg-gray-50 tracking-tighter focus:ring-2 focus:ring-[#035670] outline-none focus:bg-white transition-all duration-200 ${
                    !isEmailValid
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  value={email}
                  onChange={handleEmailChange}
                  disabled={loading}
                />
                {email && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <div
                      className={`w-2 h-2 rounded-full mt-1 mr-1 ${
                        isEmailValid ? "bg-[#035670]" : "bg-red-500"
                      } transition-colors duration-200`}
                    ></div>
                  </div>
                )}
              </div>
              {!isEmailValid && (
                <p className="text-red-500 text-xs mt-1 animate-shake">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <div className="relative animate-fade-in-up delay-200">
              <label
                htmlFor="password"
                className="block tracking-tighter font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your •••••••••"
                  className="w-full border rounded-md p-2 mt-1 pr-10 text-sm bg-gray-50 tracking-tighter focus:ring-2 focus:ring-[#035670] outline-none focus:bg-white border-gray-300 hover:border-gray-400 transition-all duration-200"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 top-[18%] right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff
                      size={16}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    />
                  ) : (
                    <Eye
                      size={16}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="animate-fade-in-up delay-300 relative z-10">
              <p className="text-red-500 text-xs px-10 py-1 bg-red-50 rounded-md animate-shake">
                {error}
              </p>
            </div>
          )}

          <div className="w-full h-full flex flex-col pr-10 mt-2 gap-2 animate-fade-in-up delay-300 relative z-10">
            <button
              type="submit"
              className="w-full bg-[#035670] text-white p-2 flex items-center justify-center rounded-md text-sm font-medium tracking-tighter hover:bg-[#066885] transition-all duration-200 ease-in-out border border-transparent hover:border-[#035670] disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
              disabled={loading || !isEmailValid || !email || !password}
              aria-disabled={loading || !isEmailValid || !email || !password}
            >
              {loading ? (
                <span className="flex items-center gap-2 text-white z-10">
                  <Loader size={16} className="animate-spin" />
                  Logging in...
                </span>
              ) : (
                <span className="relative z-10">Continue to CareSync</span>
              )}
              <span className="absolute inset-0 bg-gradient-to-r from-[#066885] to-[#035670] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </form>
      </div>

      {/* Copy Credentials Helper (bottom-right) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-md shadow-sm border border-gray-200">
        <span
          className="text-xs text-gray-600 font-mono cursor-pointer hover:text-gray-900"
          onClick={copyCredentials}
          aria-label="Copy test credentials"
        >
          {testEmail} / {testPassword}
        </span>
        <div className="flex gap-1">
          <Copy
            size={14}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={copyCredentials}
          />
          <ArrowUpRight
            size={14}
            className="text-white w-4 h-4 rounded-full bg-[#035670] hover:animate-none cursor-pointer animate-bounce"
            onClick={autoFillCredentials}
          />
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="absolute bottom-16 right-4 bg-gray-800 text-white text-xs px-3 py-2 rounded-md animate-fade-in-up">
          Copied!
        </div>
      )}

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-10px) translateX(5px);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-3px);
          }
          75% {
            transform: translateX(3px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
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
};

export default LoginPage;
