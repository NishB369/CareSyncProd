"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import EmptyState from "./Components/EmptyState";
import { ChevronDown } from "lucide-react";
import AddToQueueModal from "./Modals/AddToQueueModal";
import AddAppointmentModal from "../appointments/Modals/AddApointmentModal";

// Types
type QueueStatus = "waiting" | "withDoctor" | "completed" | "all";

interface QueueItem {
  id: string;
  patientName: string;
  phone: string;
  reason: string;
  queueNumber: string;
  status: QueueStatus;
  isUrgent: boolean;
}

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ManageQueue = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<QueueStatus>("all");
  const [queueData, setQueueData] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddtoQueueModalOpen, setIsAddtoQueueModalOpen] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Fetch queue data from backend
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/api/queue/all`, {
          withCredentials: true, // if using cookies for auth
        });

        if (response.data.success) {
          const doctors = response.data.data;

          // Flatten appointments into a single queue list
          const allAppointments: QueueItem[] = [];
          doctors.forEach((doctor: any) => {
            doctor.appointments.forEach((appt: any) => {
              // Map backend appointment to frontend QueueItem
              allAppointments.push({
                id: appt.id,
                patientName: appt.patient.name,
                phone: appt.patient.phoneNumber || "N/A",
                reason: appt.reason || "General consultation", // adjust if your backend has 'reason'
                queueNumber: String(appt.queueNumber).padStart(3, "0"), // e.g., "001"
                status:
                  appt.status === "completed"
                    ? "completed"
                    : appt.status === "withDoctor"
                    ? "withDoctor"
                    : "waiting",
                isUrgent: appt.isUrgent || false, // ensure your backend sends this
              });
            });
          });

          // Sort by queueNumber numerically
          allAppointments.sort((a, b) => {
            return parseInt(a.queueNumber) - parseInt(b.queueNumber);
          });

          setQueueData(allAppointments);
        } else {
          setError("Failed to load queue data");
        }
      } catch (err: any) {
        console.error("Error fetching queue:", err);
        setError(err.response?.data?.message || "Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    if (baseUrl) {
      fetchQueue();
    } else {
      setError("Backend URL not configured");
      setLoading(false);
    }
  }, [baseUrl]);

  const filteredQueue = queueData.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.replace(/\s/g, "").includes(searchTerm.replace(/\s/g, ""));

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    // TODO: Send status update to backend (optional for now)
    setQueueData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus as QueueStatus } : item
      )
    );
    console.log(`Updated queue item ${id} to status: ${newStatus}`);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 tracking-tighter">
      <div className="max-w-7xl mx-auto space-y-4 pb-40">
        {/* === Always visible: Header === */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="tracking-tighter text-4xl font-light">
            Manage <span className="font-medium">Queue</span>
          </h1>
          {/* Only show buttons if we have data (or not loading) */}
          {!loading && filteredQueue.length !== 0 && (
            <div className="flex items-center justify-center gap-2">
              <button
                className="px-4 py-2 bg-[#035670] text-white rounded-lg text-sm font-medium hover:bg-[#024a60] transition-colors border-2 border-transparent cursor-pointer"
                onClick={() => setIsAddtoQueueModalOpen(true)}
              >
                + Pre Booked Appointment
              </button>
              <button
                className="px-4 py-2 bg-white text-[#035670] rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border-2 cursor-pointer"
                onClick={() => setIsWalkInModalOpen(true)}
              >
                + Walk-In Patient
              </button>
            </div>
          )}
        </div>

        {/* === Search & Filters (only when not loading) === */}
        {!loading && filteredQueue.length !== 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by patient name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#035670] placeholder:text-sm"
              />
            </div>

            <div className="flex gap-2">
              {(
                ["waiting", "withDoctor", "completed", "all"] as QueueStatus[]
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    statusFilter === status
                      ? "bg-[#035670] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "waiting"
                    ? "Waiting"
                    : status === "withDoctor"
                    ? "With Doctor"
                    : status === "completed"
                    ? "Completed"
                    : "All"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === LOADING SPINNER HERE (after heading, in content area) === */}
        {loading ? (
          <div className="flex justify-center items-center py-56">
            <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-[#035670]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : filteredQueue.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filteredQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="font-bold text-lg min-w-[70px] text-center">
                  #{item.queueNumber}
                </div>
                <div className="flex-1 min-w-[220px] pl-4">
                  <p className="font-medium text-sm">{item.patientName}</p>
                  <p className="text-xs text-gray-600">
                    {item.phone} • {item.reason}
                  </p>
                </div>
                {item.isUrgent && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full whitespace-nowrap min-w-[90px] text-center mr-4">
                    ❗ Urgent
                  </span>
                )}
                {!item.isUrgent && <div className="min-w-[90px]"></div>}
                <div className="min-w-[140px] relative">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value)
                    }
                    className="w-full text-xs border rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#035670] appearance-none cursor-pointer"
                  >
                    <option value="waiting">Waiting</option>
                    <option value="withDoctor">With Doctor</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddToQueueModal
        isOpen={isAddtoQueueModalOpen}
        onClose={() => setIsAddtoQueueModalOpen(false)}
      />

      <AddAppointmentModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
        forQueue={true}
      />
    </div>
  );
};

export default ManageQueue;
