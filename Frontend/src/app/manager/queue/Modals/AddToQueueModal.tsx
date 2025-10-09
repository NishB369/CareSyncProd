"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle } from "lucide-react";

interface AddToQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddToQueueModal = ({ isOpen, onClose }: AddToQueueModalProps) => {
  const [appointmentId, setAppointmentId] = useState("");
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [error, setError] = useState("");
  const [_isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAppointmentId("");
      setAppointmentData(null);
      setError("");
      setIsUrgent(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleFetch = async () => {
    const id = appointmentId.trim().toUpperCase();
    if (!id) {
      setError("Please enter an appointment code.");
      setAppointmentData(null);
      return;
    }

    setLoading(true);
    setError("");
    setAppointmentData(null);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/code/${id}`
      );

      if (response.data.success && response.data.data) {
        const appt = response.data.data;
        setAppointmentData({
          id: appt.appointmentCode,
          patientName: appt.patient.name,
          phone: appt.patient.phoneNumber,
          doctor: `Dr. ${appt.doctor.name}`,
          time:
            new Date(appt.appointmentDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }) + ` at ${appt.slot}`,
          department: appt.doctor.specialization || "General",
          rawData: appt,
        });
      } else {
        setError(response.data.message || "Appointment not found.");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch appointment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const showInlineError =
    !loading && !appointmentData && error && !appointmentId.trim();

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
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

        <div className="p-6 space-y-5">
          <p className="text-gray-600 text-sm">
            Enter the appointment ID (e.g.,{" "}
            <code className="bg-gray-100 px-1 rounded">APT-101</code>) to load
            patient details.
          </p>

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
                disabled={loading}
              />
              <button
                onClick={handleFetch}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer ${
                  loading
                    ? "bg-gray-300 text-gray-500"
                    : "bg-[#035670] text-white hover:bg-[#024a60]"
                }`}
              >
                {loading ? "Fetching..." : "Fetch"}
              </button>
            </div>
            {showInlineError && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
          </div>

          {/* Result or Not Found UI */}
          {!loading && !showInlineError && (
            <>
              {appointmentData ? (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h1 className="font-bold text-xl mb-4 border-b border-gray-200 pb-2">
                    Appointment Found
                  </h1>
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
              ) : error ? (
                <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50 flex items-start gap-3">
                  <AlertTriangle
                    className="text-yellow-600 mt-0.5 flex-shrink-0"
                    size={20}
                  />
                  <div>
                    <h3 className="font-medium text-yellow-800">
                      Appointment Not Found
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">{error}</p>
                    <p className="text-sm text-yellow-700 mt-2">
                      Please double-check the appointment ID and try again.
                    </p>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToQueueModal;
