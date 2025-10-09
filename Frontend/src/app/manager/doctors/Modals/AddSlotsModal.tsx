"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, CheckCircle, ChevronDown } from "lucide-react";
import axios from "axios";

interface AddSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  currentSchedule: Record<string, string[]>;
  onSuccess?: () => void;
}

const daysOfWeek = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

type Day = (typeof daysOfWeek)[number];

const AddSlotsModal = ({
  isOpen,
  onClose,
  doctorId,
  currentSchedule,
  onSuccess,
}: AddSlotsModalProps) => {
  const [selectedDay, setSelectedDay] = useState<Day | "">("");
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([
    { start: "", end: "" },
  ]);
  const [timeErrors, setTimeErrors] = useState<boolean[]>([false]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const resetForm = () => {
    setSelectedDay("");
    setTimeSlots([{ start: "", end: "" }]);
    setTimeErrors([false]);
    setErrors({});
    setSubmitSuccess(false);
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const handleAddSlot = () => {
    setTimeSlots([...timeSlots, { start: "", end: "" }]);
    setTimeErrors([...timeErrors, false]);
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = [...timeSlots];
    newSlots.splice(index, 1);
    setTimeSlots(newSlots);

    const newErrors = [...timeErrors];
    newErrors.splice(index, 1);
    setTimeErrors(newErrors);
  };

  const handleSlotChange = (
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);

    const newErrors = [...timeErrors];
    if (newSlots[index].start && newSlots[index].end) {
      const startMins = timeToMinutes(newSlots[index].start);
      const endMins = timeToMinutes(newSlots[index].end);
      newErrors[index] = startMins >= endMins;
    } else {
      newErrors[index] = false;
    }
    setTimeErrors(newErrors);
  };

  const timeToMinutes = (time24: string): number => {
    if (!time24) return 0;
    const [h, m] = time24.split(":").map(Number);
    return h * 60 + m;
  };

  const formatTo12Hour = (time24: string): string => {
    if (!time24) return "";
    const [hoursStr, minutesStr] = time24.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) return "";

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");

    return `${displayHours}:${displayMinutes}${period}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedDay) newErrors.day = "Please select a day";
    if (timeSlots.some((s) => !s.start || !s.end))
      newErrors.slots = "All time slots must be complete";
    if (timeErrors.some((err) => err))
      newErrors.slots = "Start time must be before end time";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    const validSlots = timeSlots
      .filter((slot) => slot.start && slot.end)
      .map(
        (slot) => `${formatTo12Hour(slot.start)}-${formatTo12Hour(slot.end)}`
      );

    const newSchedule = { ...currentSchedule };
    newSchedule[selectedDay] = [
      ...(newSchedule[selectedDay] || []),
      ...validSlots,
    ].filter((slot, i, arr) => arr.indexOf(slot) === i);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/doctor/edit/${doctorId}`,
        { schedule: JSON.stringify(newSchedule) },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSubmitSuccess(true);
        onSuccess?.();

        setTimeout(() => {
          setSubmitSuccess(false);
          onClose();
        }, 1500);
      } else {
        setErrors({
          submit: response.data.message || "Failed to update schedule",
        });
      }
    } catch (err: any) {
      console.error("Update schedule error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to update doctor's schedule. Please try again.";
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4 tracking-tighter"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-slots-modal-title"
    >
      <div
        className="bg-white rounded-lg w-full max-w-md border border-gray-300 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h2
            id="add-slots-modal-title"
            className="text-lg font-semibold text-gray-800"
          >
            {submitSuccess ? "Success!" : "Add Availability"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 rounded-full p-1 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-700">
              Availability updated for <strong>{selectedDay}</strong>!
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Day Selector */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Day *
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as Day)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
                  errors.day
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-300 focus:ring-[#035670]"
                }`}
              >
                <option value="">Choose a day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 mt-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
              {errors.day && (
                <p className="mt-1 text-sm text-red-600">{errors.day}</p>
              )}
            </div>

            {/* Time Slots */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Time Slots *
                </label>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="text-[#035670] hover:text-[#066885] flex items-center gap-1 cursor-pointer text-sm"
                >
                  <Plus size={14} />
                  Add Slot
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          handleSlotChange(index, "start", e.target.value)
                        }
                        className="flex-1 px-2 py-1.5 border rounded text-sm cursor-pointer"
                      />
                      <span className="flex items-center text-sm">to</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          handleSlotChange(index, "end", e.target.value)
                        }
                        className="flex-1 px-2 py-1.5 border rounded text-sm cursor-pointer"
                      />
                      {timeSlots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    {timeErrors[index] && (
                      <p className="text-xs text-red-500 ml-1">
                        Start time must be before end time
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {errors.slots && (
                <p className="mt-1 text-sm text-red-600">{errors.slots}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <p className="text-red-600 text-sm text-center">
                {errors.submit}
              </p>
            )}

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !selectedDay ||
                timeSlots.some((s) => !s.start || !s.end) ||
                timeErrors.some((err) => err)
              }
              className={`w-full py-2.5 px-4 rounded-md font-medium text-white transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#035670] hover:bg-[#066885] cursor-pointer"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Availability"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSlotsModal;
