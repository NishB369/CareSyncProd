"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { helpItems, faqs } from "./HelpData";

export default function HelpSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleAction = (actionType: string) => {
    switch (actionType) {
      case "Send Email":
        window.location.href = "mailto:support@ioi.edu";
        break;
      case "Call Now":
        window.location.href = "tel:+91 80-1234-5678";
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:p-2 font-light tracking-tighter">
      <div className="max-w-7xl mx-auto space-y-4">
        <div>
          <h2 className="text-3xl font-medium text-gray-800 mb-2">
            Help & Support
          </h2>
          <p className="text-gray-600">
            Get assistance with your academic journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white/80 shadow-sm rounded-sm border border-slate-700/50"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-[#035670]/75 rounded-sm">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <button
                    onClick={() => handleAction(item.action)}
                    className="w-full bg-[#035670] hover:bg-[#066885] text-white py-2 px-4 rounded-sm font-medium transition-colors cursor-pointer ease-in-out duration-300"
                  >
                    {item.action}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white/80 shadow-sm rounded-sm border border-slate-700/50">
          <div className="p-6">
            <h3 className="text-xl font-medium text-gray-800 mb-6">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-sm">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-sm cursor-pointer"
                  >
                    <h4 className="font-medium text-gray-800 pr-4 tracking-tight">
                      {faq.question}
                    </h4>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/80 shadow-sm rounded-sm border border-slate-700/50">
          <div className="p-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-sm flex items-center justify-center flex-col border border-slate-700/50">
                <div className="h-12 w-12 rounded-full bg-[#035670] p-1 flex items-center justify-center mb-3">
                  <Phone className="text-white w-5 h-5" />
                </div>
                <div className="text-sm text-gray-600">Support Hotline</div>
                <div className="font-semimedium text-gray-800">
                  +91 80-1234-5678
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-sm flex items-center justify-center flex-col border border-slate-700/50">
                <div className="h-12 w-12 rounded-full bg-[#035670] p-1 flex items-center justify-center mb-3">
                  <Mail className="text-white w-5 h-5" />
                </div>
                <div className="text-sm text-gray-600">Email Support</div>
                <div className="font-semimedium text-gray-800">
                  support@ioi.edu | tech@ioi.edu
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-sm flex items-center justify-center flex-col border border-slate-700/50">
                <div className="h-12 w-12 rounded-full bg-[#035670] p-1 flex items-center justify-center mb-3">
                  <MessageCircle className="text-white w-5 h-5" />
                </div>
                <div className="text-sm text-gray-600">Live Chat</div>
                <div className="font-semimedium text-gray-800">
                  Available 24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
