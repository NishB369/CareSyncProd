"use client";

import React, { useState } from "react"; // ✅ add useState
import { X, AlertTriangle, Loader2 } from "lucide-react"; // ✅ add Loader2 for spinner
import axios from "axios";

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment: {
    id: string;
    startTime: Date;
    patient: { name: string };
    doctor: { name: string };
  };
}

const CancelConfirmationModal = ({
  isOpen,
  onClose,
  onSuccess,
  appointment,
}: CancelConfirmationModalProps) => {
  const [isLoading, setIsLoading] = useState(false); // ✅ loading state

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const startTime = appointment.startTime;
  const formattedDate = startTime.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const formattedTime = startTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleConfirm = async () => {
    setIsLoading(true); // ✅ start loading
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BACKEND_URL is not set");
      }

      await axios.delete(`${baseUrl}/api/appointment/${appointment.id}`, {
        withCredentials: true,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setIsLoading(false); // ✅ stop loading (on success OR error)
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4 tracking-tighter"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <div
        className="bg-white rounded-lg w-full max-w-md border border-gray-300 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h2
            id="cancel-modal-title"
            className="text-lg font-semibold text-gray-800"
          >
            Confirm Cancellation
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading} // ✅ disable close while loading (optional)
            className="text-gray-500 hover:text-gray-800 rounded-full p-1 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          <p className="text-gray-700 mb-2">
            Are you sure you want to cancel your appointment?
          </p>

          <div className="text-gray-900 font-medium mb-4">
            <div>
              {formattedDate} at {formattedTime}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              With Dr. {appointment.doctor.name}
            </div>
            <div className="text-sm text-gray-600">
              Patient: {appointment.patient.name}
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone. The appointment will be permanently
            cancelled.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-70"
            >
              Keep Appointment
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Appointment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;
