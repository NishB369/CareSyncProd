"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Appointment } from "../ManageAppointments";
import { ChevronDown, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment: Appointment | null;
};

const RescheduleAppointmentModal = ({
  isOpen,
  onClose,
  onSuccess,
  appointment,
}: Props) => {
  const [newDate, setNewDate] = useState<string>("");
  const [newSlot, setNewSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && appointment) {
      const today = new Date();
      const minDate = today.toISOString().split("T")[0];
      setNewDate(minDate);
      setNewSlot("");
      setAvailableSlots([]);
      setError(null);
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    if (!newDate || !appointment) return;

    const fetchSlots = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!baseUrl) throw new Error("Backend URL not configured");

        const res = await axios.get(
          `${baseUrl}/api/doctor/${appointment.doctor.id}/slots`,
          {
            params: { date: newDate },
            withCredentials: true,
          }
        );

        console.log(res.data.data);
        setAvailableSlots(res.data.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        setError("Could not load available slots. Please try another date.");
        setAvailableSlots([]);
      }
    };

    fetchSlots();
  }, [newDate, appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !newDate || !newSlot) return;

    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseUrl) throw new Error("Backend URL not configured");

      await axios.post(
        `${baseUrl}/api/appointment/reschedule/${appointment.id}`,
        {
          id: appointment.id,
          appointmentDate: newDate,
          slot: newSlot,
        },
        { withCredentials: true }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Reschedule failed:", err);
      const message =
        err.response?.data?.message ||
        "Failed to reschedule appointment. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="w-full relative">
            <h2 className="text-xl font-semibold mb-4">
              Reschedule Appointment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 rounded-full p-1 cursor-pointer absolute top-0 right-0 hover:bg-gray-200 duration-100 ease-in-out bg-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Current Appointment Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
            <p>
              <span className="font-medium">Patient:</span>{" "}
              {appointment.patient.name}
            </p>
            <p>
              <span className="font-medium">Doctor:</span>{" "}
              {appointment.doctor.name} ({appointment.doctor.specialization})
            </p>
            <p>
              <span className="font-medium">Current:</span>{" "}
              {formatDate(appointment.startTime)} •{" "}
              {formatTime(appointment.startTime)} –{" "}
              {formatTime(appointment.endTime)}
            </p>
            <p>
              <span className="font-medium">Status:</span> {appointment.status}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* New Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">New Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#035670]"
                required
              />
            </div>

            {/* New Slot */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                New Time Slot
              </label>

              {availableSlots.length > 0 ? (
                <div className="relative">
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#035670] appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select a slot</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {error || "Select a date to see available slots"}
                </p>
              )}
            </div>

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !newSlot}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  loading || !newSlot
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#035670] hover:bg-[#066885] cursor-pointer"
                }`}
              >
                {loading ? "Rescheduling..." : "Reschedule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RescheduleAppointmentModal;
