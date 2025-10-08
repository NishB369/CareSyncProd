"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import EmptyState from "./Components/EmptyState";
import { ChevronDown, FilterIcon, PlusCircle } from "lucide-react";
import AppointmentCard from "./Components/AppointmentCard";
import AddAppointmentModal from "./Modals/AddApointmentModal";
import CancelConfirmationModal from "./Modals/CancelConfirmationModal";
import axios from "axios";
import RescheduleAppointmentModal from "./Modals/RescheduleAppointmentModal";

const LoadingShimmer = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mb-4" />
      <div className="h-4 bg-gray-200 rounded w-48 animate-pulse mb-2" />
      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
    </div>
  );
};

// Fixed "today" for consistent demo
export const TODAY = new Date(2025, 9, 5); // Oct 5, 2025

type StatusFilter =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "ALL";

// UI-facing Appointment type
// UI-facing Appointment type (updated)
export type Appointment = {
  id: string;
  appointmentCode: string; // ← added
  patient: {
    name: string;
    phone: string;
    age: number;
    gender?: string; // ← added
    issue?: string; // ← added
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
    image?: string; // ← added (URL or undefined)
    // location removed per your request
  };
  startTime: Date;
  endTime: Date;
  status: StatusFilter;
};

// API response shape – matches your actual payload
type ApiAppointment = {
  id: string;
  doctorId: string;
  patientId: string;
  queueNumber: number;
  appointmentDate: string; // ISO string: "2025-10-10T00:00:00.000Z"
  slot: string; // e.g., "11:49AM-12:50PM"
  queueType: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  createdAt: string;
  updatedAt: string;
  appointmentCode: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    image: string;
    isAvailable: boolean;
  };
  patient: {
    id: string;
    name: string;
    phoneNumber: string;
    age: number;
    gender: string;
    issue: string;
  };
};

const ManageAppointments = () => {
  const advancedFiltersRef = useRef<HTMLDivElement>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return formatDate(today); // Use the formatDate function from Option 2
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [doctorFilter, setDoctorFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = showAdvancedFilters ? 4 : 5;
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRescheduleClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setRescheduleModalOpen(true);
  };

  // Parse time like "11:49AM" → { hours, minutes }
  const parseTime = (timeStr: string) => {
    const clean = timeStr.trim();
    const isPM = clean.includes("PM");
    const isAM = clean.includes("AM");
    const timePart = clean.replace("AM", "").replace("PM", "").trim();
    const arr = timePart.split(":").map(Number);
    let hours = arr[0];
    const minutes = arr[1];

    if (isPM && hours !== 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return { hours, minutes };
  };

  const mapApiToUiAppointment = (apiApt: ApiAppointment): Appointment => {
    const aptDate = new Date(apiApt.appointmentDate);
    const [startSlot, endSlot] = apiApt.slot.split("-");

    const { hours: startH, minutes: startM } = parseTime(startSlot);
    const { hours: endH, minutes: endM } = parseTime(endSlot);

    const startTime = new Date(aptDate);
    startTime.setHours(startH, startM, 0, 0);

    const endTime = new Date(aptDate);
    endTime.setHours(endH, endM, 0, 0);

    // Map PENDING → BOOKED for UI
    const status: StatusFilter = apiApt.status;

    return {
      id: apiApt.id,
      appointmentCode: apiApt.appointmentCode, // ✅
      patient: {
        name: apiApt.patient.name,
        phone: apiApt.patient.phoneNumber,
        age: apiApt.patient.age,
        gender: apiApt.patient.gender, // ✅
        issue: apiApt.patient.issue, // ✅
      },
      doctor: {
        id: apiApt.doctor.id,
        name: apiApt.doctor.name,
        specialization: apiApt.doctor.specialization,
        image: apiApt.doctor.image, // ✅ (can be undefined)
        // location: removed
      },
      startTime,
      endTime,
      status,
    };
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BACKEND_URL is not set");
      }

      const res = await axios.get(
        `${baseUrl}/api/appointment/all-appointments`,
        {
          params: { date: selectedDate },
          withCredentials: true,
        }
      );

      const apiAppointments: ApiAppointment[] = res.data.data || [];
      const mappedAppointments = apiAppointments.map(mapApiToUiAppointment);
      setAppointments(mappedAppointments);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchAppointments();
  }, [selectedDate]);

  const uniqueDoctors = useMemo(() => {
    return Array.from(new Set(appointments.map((apt) => apt.doctor.name)));
  }, [appointments]);

  const handleCancelClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setCancelModalOpen(true);
  };

  const cancelAppointment = (appointmentId: string) => {
    console.log(`Cancelled appointment with id: ${appointmentId}`);
    // TODO: Call cancel API endpoint
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesSearch =
        apt.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient.phone
          .replace(/\s/g, "")
          .includes(searchTerm.replace(/\s/g, ""));

      const matchesStatus =
        statusFilter === "ALL" || apt.status === statusFilter;

      const matchesDoctor =
        doctorFilter === "ALL" || apt.doctor.name === doctorFilter;

      return matchesSearch && matchesStatus && matchesDoctor;
    });
  }, [appointments, searchTerm, statusFilter, doctorFilter]);

  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + appointmentsPerPage
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setDoctorFilter("ALL");
    handleFilterChange();
  };

  return (
    <div className="min-h-screen p-2 tracking-tighter flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="tracking-tighter text-4xl font-light">
            Manage <span className="font-medium">Appointments</span>
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#035670] text-white px-4 py-2 rounded-md hover:bg-[#066885] transition-colors cursor-pointer"
          >
            <PlusCircle size={18} />
            Add Appointment
          </button>
        </div>

        {/* Search & Date Picker */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by patient name or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#035670] placeholder:text-sm"
            />
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#035670] cursor-pointer"
            />

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1 px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              aria-expanded={showAdvancedFilters}
              aria-controls="advanced-filters-content"
            >
              <FilterIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  showAdvancedFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div
          id="advanced-filters-content"
          ref={advancedFiltersRef}
          style={{
            maxHeight: showAdvancedFilters
              ? `${advancedFiltersRef.current?.scrollHeight}px`
              : "0px",
          }}
          className="overflow-hidden transition-all duration-300 ease-in-out mt-2"
        >
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between w-full">
              <div className="w-1/4 relative">
                <select
                  value={doctorFilter}
                  onChange={(e) => {
                    setDoctorFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#035670] appearance-none cursor-pointer"
                >
                  <option value="ALL">All Doctors</option>
                  {uniqueDoctors.map((doctor) => (
                    <option key={doctor} value={doctor}>
                      {doctor}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>

              <div className="flex items-center gap-2 w-3/4 justify-end">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "PENDING",
                      "COMPLETED",
                      "CANCELLED",
                      "RESCHEDULED",
                      "ALL",
                    ] as StatusFilter[]
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        handleFilterChange();
                      }}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        statusFilter === status
                          ? "bg-[#035670] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status === "ALL"
                        ? "All"
                        : status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                >
                  Remove All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-[#035670]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : paginatedAppointments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {paginatedAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  onCancel={() => handleCancelClick(apt)}
                  onReschedule={() => handleRescheduleClick(apt)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center absolute bottom-0 pb-14 w-full">
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-[#035670] hover:bg-gray-100 cursor-pointer"
                }`}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-md cursor-pointer ${
                    currentPage === i + 1
                      ? "bg-[#035670] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-[#035670] hover:bg-gray-100 cursor-pointer"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <CancelConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onSuccess={fetchAppointments} // ✅ This will refresh the list
        appointment={selectedAppointment!}
      />

      <RescheduleAppointmentModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        onSuccess={fetchAppointments}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default ManageAppointments;
