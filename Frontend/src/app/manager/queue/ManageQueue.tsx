"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import EmptyState from "./Components/EmptyState";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import AddToQueueModal from "./Modals/AddToQueueModal";
import AddAppointmentModal from "../appointments/Modals/AddApointmentModal";

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

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  image: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ManageQueue = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<QueueStatus>("all");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allAppointments, setAllAppointments] = useState<
    Record<string, QueueItem[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDoctors, setExpandedDoctors] = useState<Set<string>>(
    new Set()
  );
  const [isAddtoQueueModalOpen, setIsAddtoQueueModalOpen] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/api/queue/all`, {
          withCredentials: true,
        });

        if (response.data.success) {
          const backendDoctors = response.data.data;

          const doctorList: Doctor[] = [];
          const apptMap: Record<string, QueueItem[]> = {};

          backendDoctors.forEach((doc: any) => {
            doctorList.push({
              id: doc.id,
              name: doc.name,
              specialization: doc.specialization,
              image: doc.image?.trim() || "",
            });

            const appointments: QueueItem[] = doc.appointments.map(
              (appt: any) => ({
                id: appt.id,
                patientName: appt.patient.name,
                phone: appt.patient.phoneNumber || "N/A",
                reason: appt.reason || "General consultation",
                queueNumber: String(appt.queueNumber).padStart(3, "0"),
                status:
                  appt.status === "completed"
                    ? "completed"
                    : appt.status === "withDoctor"
                    ? "withDoctor"
                    : "waiting",
                isUrgent: appt.isUrgent || false,
              })
            );

            appointments.sort(
              (a, b) => parseInt(a.queueNumber) - parseInt(b.queueNumber)
            );
            apptMap[doc.id] = appointments;
          });

          setDoctors(doctorList);
          setAllAppointments(apptMap);
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

  const toggleExpand = (doctorId: string) => {
    setExpandedDoctors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(doctorId)) {
        newSet.delete(doctorId);
      } else {
        newSet.add(doctorId);
      }
      return newSet;
    });
  };

  const filteredData = useMemo(() => {
    if (selectedDoctorId !== "all") {
      const appts = allAppointments[selectedDoctorId] || [];
      return appts.filter((item) => {
        const matchesSearch =
          item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phone.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, ""));
        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }

    const result: Record<string, QueueItem[]> = {};
    let hasAny = false;

    doctors.forEach((doc) => {
      const appts = allAppointments[doc.id] || [];
      const filtered = appts.filter((item) => {
        const matchesSearch =
          item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phone.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, ""));
        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      });

      if (filtered.length > 0) {
        hasAny = true;
        result[doc.id] = filtered;
      }
    });

    return hasAny ? result : null;
  }, [selectedDoctorId, allAppointments, doctors, searchTerm, statusFilter]);

  const handleStatusChange = (
    doctorId: string,
    appointmentId: string,
    newStatus: string
  ) => {
    setAllAppointments((prev) => {
      const updated = { ...prev };
      if (updated[doctorId]) {
        updated[doctorId] = updated[doctorId].map((appt) =>
          appt.id === appointmentId
            ? { ...appt, status: newStatus as QueueStatus }
            : appt
        );
      }
      return updated;
    });
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="tracking-tighter text-4xl font-light">
            Manage <span className="font-medium">Queue</span>
          </h1>
          {!loading && (
            <div className="flex items-center justify-center gap-2">
              <button
                className="px-4 py-2 bg-[#035670] text-white rounded-lg text-sm font-medium hover:bg-[#024a60] transition-colors border-2 border-transparent"
                onClick={() => setIsAddtoQueueModalOpen(true)}
              >
                + Pre Booked Appointment
              </button>
              <button
                className="px-4 py-2 bg-white text-[#035670] rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border-2"
                onClick={() => setIsWalkInModalOpen(true)}
              >
                + Walk-In Patient
              </button>
            </div>
          )}
        </div>

        {/* Search + Filters + Doctor Dropdown */}
        {!loading && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-4">
            <div className="flex gap-3 w-2/3 items-center justify-start">
              <div className="w-1/2">
                <input
                  type="text"
                  placeholder="Search by patient name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#035670] placeholder:text-sm"
                />
              </div>

              <div className="relative w-1/3">
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#035670] text-sm appearance-none cursor-pointer w-full"
                >
                  <option value="all">All Doctors</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-2 mt-2 sm:mt-0">
              {(
                ["waiting", "withDoctor", "completed", "all"] as QueueStatus[]
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`text-sm px-4 py-1.5 rounded-full cursor-pointer font-medium transition-colors ${
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

        {/* Loading / Error / Empty */}
        {loading ? (
          <div className="flex justify-center items-center py-56">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#035670]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : selectedDoctorId !== "all" ? (
          filteredData?.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {(filteredData as QueueItem[])?.map((item) => (
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
                        handleStatusChange(
                          selectedDoctorId,
                          item.id,
                          e.target.value
                        )
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
          )
        ) : !filteredData ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor) => {
              const appts =
                filteredData &&
                typeof filteredData === "object" &&
                !Array.isArray(filteredData)
                  ? filteredData[doctor.id]
                  : undefined;
              if (!appts || appts.length === 0) return null;

              const isExpanded = expandedDoctors.has(doctor.id);

              return (
                <div
                  key={doctor.id}
                  className="border rounded-lg overflow-hidden shadow-sm"
                >
                  {/* Doctor Header (Clickable to expand) */}
                  <div
                    className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleExpand(doctor.id)}
                  >
                    <div className="flex items-center gap-3">
                      {doctor.image ? (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {doctor.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">
                          {doctor.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {appts.length}{" "}
                        {appts.length === 1 ? "patient" : "patients"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Appointments (Collapsible) */}
                  {isExpanded && (
                    <div className="divide-y">
                      {appts.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center p-3 hover:bg-gray-50"
                        >
                          <div className="font-bold text-lg min-w-[70px] text-center">
                            #{item.queueNumber}
                          </div>
                          <div className="flex-1 min-w-[220px] pl-4">
                            <p className="font-medium text-sm">
                              {item.patientName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {item.phone} • {item.reason}
                            </p>
                          </div>
                          {item.isUrgent && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full whitespace-nowrap min-w-[90px] text-center mr-4">
                              ❗ Urgent
                            </span>
                          )}
                          {!item.isUrgent && (
                            <div className="min-w-[90px]"></div>
                          )}
                          <div className="min-w-[140px] relative">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  doctor.id,
                                  item.id,
                                  e.target.value
                                )
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
              );
            })}
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
        onSuccess={() => window.location.reload()}
        forQueue={true}
      />
    </div>
  );
};

export default ManageQueue;
