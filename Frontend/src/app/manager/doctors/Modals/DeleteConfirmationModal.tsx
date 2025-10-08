// DeleteConfirmationModal.tsx
"use client";

import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import axios from "axios";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Required: parent passes fetchDoctors
  doctorId: string; // Need ID to delete
  doctorName: string;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onSuccess,
  doctorId,
  doctorName,
}: DeleteConfirmationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/doctor/${doctorId}`,
        { withCredentials: true }
      );

      // ✅ Close modal, then notify parent to refresh
      onClose();
      onSuccess(); // ← this is fetchDoctors from parent
    } catch (err: any) {
      console.error("Delete failed:", err);
      setError(err.response?.data?.message || "Failed to delete doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4 tracking-tighter"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="bg-white rounded-lg w-full max-w-md border border-gray-300 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h2
            id="delete-modal-title"
            className="text-lg font-semibold text-gray-800"
          >
            Confirm Deletion
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 rounded-full p-1 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          <p className="text-gray-700 mb-2">Are you sure you want to delete</p>
          <p className="font-medium text-gray-900 mb-4">
            &ldquo;Dr. {doctorName}&rdquo;?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone. All associated data will be
            permanently removed.
          </p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
                loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
              } text-white disabled:opacity-70`}
            >
              {loading ? "Deleting..." : "Delete Doctor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
