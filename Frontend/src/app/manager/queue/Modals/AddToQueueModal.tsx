"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface AddToQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddToQueueModal = ({ isOpen, onClose }: AddToQueueModalProps) => {
  const [appointmentId, setAppointmentId] = useState("");
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [error, setError] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAppointmentId("");
      setAppointmentData(null);
      setError("");
      setIsUrgent(false);
    }
  }, [isOpen]);

  const mockAppointments: Record<string, any> = {
    "APT-101": {
      id: "APT-101",
      patientName: "Rajesh Kumar",
      phone: "+91 98765 43210",
      doctor: "Dr. Ananya Patel",
      time: "10:00 AM, Oct 6",
      department: "Cardiology",
    },
    "APT-102": {
      id: "APT-102",
      patientName: "Priya Sharma",
      phone: "+91 87654 32109",
      doctor: "Dr. Vikram Singh",
      time: "2:00 PM, Oct 6",
      department: "Dermatology",
    },
    "APT-103": {
      id: "APT-103",
      patientName: "Amit Verma",
      phone: "+91 76543 21098",
      doctor: "Dr. Meera Desai",
      time: "11:30 AM, Oct 6",
      department: "Pediatrics",
    },
  };

  const handleFetch = () => {
    const id = appointmentId.trim().toUpperCase();
    if (mockAppointments[id]) {
      setAppointmentData(mockAppointments[id]);
      setError("");
    } else {
      setError("Appointment not found. Try APT-101, APT-102, or APT-103.");
      setAppointmentData(null);
    }
  };

  const handleAddToQueue = () => {
    console.log("Adding to queue:", {
      appointmentId: appointmentData.id,
      isUrgent,
    });
    alert(
      `✅ Added ${appointmentData.patientName} to queue${
        isUrgent ? " (Urgent)" : ""
      }`
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Add Booked Patient to Queue</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-gray-600 text-sm">
            Enter the appointment ID (e.g.,{" "}
            <code className="bg-gray-100 px-1 rounded">APT-101</code>) to load
            patient details.
          </p>

          {/* Input + Fetch */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Appointment ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                placeholder="APT-101"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#035670]"
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              />
              <button
                onClick={handleFetch}
                className="px-4 py-2 bg-[#035670] text-white rounded-lg text-sm hover:bg-[#024a60] whitespace-nowrap cursor-pointer"
              >
                Fetch
              </button>
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>

          {/* Appointment Card */}
          {appointmentData && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {appointmentData.patientName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {appointmentData.phone}
                  </p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Booked
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Doctor:</span>{" "}
                  {appointmentData.doctor}
                </p>
                <p>
                  <span className="font-medium">Department:</span>{" "}
                  {appointmentData.department}
                </p>
                <p>
                  <span className="font-medium">Time:</span>{" "}
                  {appointmentData.time}
                </p>
              </div>
            </div>
          )}

          {/* Urgent Checkbox — YOUR EXACT UI */}
          {appointmentData && (
            <div className="pt-2">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="mt-1 mr-2 h-4 w-4 text-[#035670] rounded focus:ring-[#035670]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mark as urgent case
                  <span className="ml-1 text-xs text-gray-500">
                    (Priority queue)
                  </span>
                </span>
              </label>
              {isUrgent && (
                <div className="mt-2 flex items-start p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    This appointment will be prioritized in the queue. Only
                    select if medically necessary.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {appointmentData && (
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToQueue}
                className="px-4 py-2 bg-[#035670] text-white rounded-lg text-sm font-medium hover:bg-[#024a60] cursor-pointer"
              >
                Add to Queue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToQueueModal;
