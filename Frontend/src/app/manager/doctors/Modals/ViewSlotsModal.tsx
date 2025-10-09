"use client";

import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";

interface ViewSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Record<string, string[]>;
}

const dayDisplayNames: Record<string, string> = {
  SUNDAY: "Sunday",
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

const dayOrder = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const ViewSlotsModal = ({ isOpen, onClose, schedule }: ViewSlotsModalProps) => {
  const [filterDay, setFilterDay] = useState<string | "">("");

  if (!isOpen) return null;

  const validScheduleDays = Object.keys(schedule).filter((day) =>
    dayOrder.includes(day)
  );

  const sortedEntries = validScheduleDays
    .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
    .map((day) => [day, schedule[day]] as [string, string[]]);

  const filteredEntries = filterDay
    ? sortedEntries.filter(([day]) => day === filterDay)
    : sortedEntries;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4 tracking-tighter">
      <div className="bg-white rounded-lg w-full max-w-md border border-gray-300 shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Doctor’s Available Slots
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 rounded-full p-1 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {/* Day Filter */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Day
            </label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#035670] appearance-none cursor-pointer"
            >
              <option value="">All Days</option>
              {dayOrder.map((day) => (
                <option key={day} value={day}>
                  {dayDisplayNames[day]}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 mt-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>

          {/* Schedule List */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1 flex-1">
            {filteredEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {filterDay
                  ? `No slots available on ${dayDisplayNames[filterDay]}`
                  : "No availability added yet"}
              </p>
            ) : (
              filteredEntries.map(([dayKey, slots]) => (
                <div key={dayKey} className="border rounded-lg p-3">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {dayDisplayNames[dayKey] || dayKey}
                  </h3>
                  <div className="space-y-1.5">
                    {slots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-blue-50 rounded px-2 py-1"
                      >
                        <span className="text-[#035670] font-mono text-sm">
                          {slot.split("-").join(" - ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSlotsModal;
