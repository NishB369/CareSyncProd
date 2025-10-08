"use client";

import React, { useState } from "react";
import EmptyState from "./Components/EmptyState";
import { ChevronDown } from "lucide-react";
import AddToQueueModal from "./Modals/AddToQueueModal";
import AddAppointmentModal from "../appointments/Modals/AddApointmentModal";

// Initial queue data — Indian clinic context
const initialQueue = [
  {
    id: "q-001",
    patientName: "Rajesh Kumar",
    phone: "+91 98765 43210",
    reason: "Fever and cough",
    queueNumber: "001",
    status: "waiting" as const,
    isUrgent: false,
  },
  {
    id: "q-002",
    patientName: "Priya Sharma",
    phone: "+91 87654 32109",
    reason: "Skin rash consultation",
    queueNumber: "002",
    status: "withDoctor" as const,
    isUrgent: false,
  },
  {
    id: "q-003",
    patientName: "Amit Verma",
    phone: "+91 76543 21098",
    reason: "Chest pain – needs immediate attention",
    queueNumber: "003",
    status: "waiting" as const,
    isUrgent: true,
  },
  {
    id: "q-004",
    patientName: "Sunita Patel",
    phone: "+91 98123 45678",
    reason: "Follow-up for diabetes",
    queueNumber: "004",
    status: "completed" as const,
    isUrgent: false,
  },
];

// const initialQueue = [];

type QueueStatus = "waiting" | "withDoctor" | "completed" | "all";

const ManageQueue = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<QueueStatus>("all");
  const [queueData, setQueueData] = useState(initialQueue);
  const [isAddtoQueueModalOpen, setIsAddtoQueueModalOpen] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  //   const filteredQueue = [];
  const filteredQueue = queueData.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.replace(/\s/g, "").includes(searchTerm.replace(/\s/g, ""));

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    setQueueData((prevQueue) =>
      prevQueue.map((item) =>
        item.id === id
          ? { ...item, status: newStatus as Exclude<QueueStatus, "all"> }
          : item
      )
    );
    console.log(`Updated queue item ${id} to status: ${newStatus}`);
  };

  return (
    <div className="min-h-screen p-2 tracking-tighter">
      <div className="max-w-7xl mx-auto space-y-4 pb-40">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="tracking-tighter text-4xl font-light">
            Manage <span className="font-medium">Queue</span>
          </h1>
          {filteredQueue.length !== 0 && (
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

        {/* Search & Status Pills */}
        {filteredQueue.length !== 0 && (
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

        {/* Queue List */}
        {filteredQueue.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filteredQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
              >
                {/* Queue Number */}
                <div className="font-bold text-lg min-w-[70px] text-center">
                  #{item.queueNumber}
                </div>

                {/* Patient Info */}
                <div className="flex-1 min-w-[220px] pl-4">
                  <p className="font-medium text-sm">{item.patientName}</p>
                  <p className="text-xs text-gray-600">
                    {item.phone} • {item.reason}
                  </p>
                </div>

                {/* Urgent Pill (Only if urgent) */}
                {item.isUrgent && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full whitespace-nowrap min-w-[90px] text-center mr-4">
                    ❗ Urgent
                  </span>
                )}
                {!item.isUrgent && <div className="min-w-[90px]"></div>}

                {/* Status Dropdown (Right) */}
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
