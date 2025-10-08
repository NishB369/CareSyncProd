"use client";

import React, { useState, useMemo, useEffect } from "react";
import DoctorsTileView from "./Components/DoctorsTileView";
import DoctorsListView from "./Components/DoctorsListView";
import EmptyState from "./Components/EmptyState";
import { PlusCircle, LayoutGrid, List, ChevronDown } from "lucide-react";
import AddDoctorModal from "./Modals/AddDoctorModal";
import DeleteConfirmationModal from "./Modals/DeleteConfirmationModal";
import axios from "axios";
import EditDoctorModal from "./Modals/EditDoctorModal";
import ShimmerGrid from "./Components/ShimmerGrid";
import ShimmerList from "./Components/ShimmerList";

export interface Doctor {
  id: string;
  name: string;
  image: string;
  phoneNumber: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  specialization: string;
  isAvailable: boolean;
  schedule: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    role: "DOCTOR" | "STAFF" | "PATIENT";
  } | null;
}

const ManageDoctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [sortOption, setSortOption] = useState<"name" | "joinedAt">("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/doctor/all-doctors`,
        { withCredentials: true }
      );

      const fetchedDoctors: Doctor[] = response.data.data || [];
      setDoctors(fetchedDoctors);
    } catch (err: any) {
      console.error("Failed to fetch doctors:", err);
      setError(err.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const specializations = useMemo(() => {
    return Array.from(new Set(doctors.map((doc) => doc.specialization)));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let result = [...doctors];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.name.toLowerCase().includes(term) ||
          (doc.user?.email && doc.user.email.toLowerCase().includes(term)) ||
          doc.specialization.toLowerCase().includes(term) ||
          doc.phoneNumber.includes(term)
      );
    }

    if (specializationFilter !== "all") {
      result = result.filter(
        (doc) => doc.specialization === specializationFilter
      );
    }

    result.sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

    return result;
  }, [doctors, searchTerm, specializationFilter, sortOption]);

  const handleScheduleUpdated = () => {
    fetchDoctors();
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#035670] text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 tracking-tighter">
      <div className="max-w-7xl mx-auto space-y-4 pb-40">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="tracking-tighter text-4xl font-light">
            Manage <span className="font-medium">Doctors</span>
          </h1>
          {!loading && !error ? (
            doctors.length !== 0 && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-[#035670] text-white px-4 py-2 rounded-md hover:bg-[#066885] transition-colors cursor-pointer"
              >
                <PlusCircle size={18} />
                Add Doctor
              </button>
            )
          ) : (
            <div className="flex items-center gap-2 bg-gray-200 text-transparent px-4 py-2 rounded-md w-32 animate-pulse">
              + Add Doctor
            </div>
          )}
        </div>

        {/* Filters & View Toggle — always visible (even during loading) */}
        {(doctors.length !== 0 || loading) && !error && (
          <div className="text-sm my-6">
            <div className="flex flex-col md:flex-row gap-4 w-full justify-between">
              <div className="flex items-center justify-center gap-2 w-full md:w-3/4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#035670] cursor-pointer"
                    disabled={loading}
                  />
                </div>

                <div className="w-full md:w-48 relative">
                  <select
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#035670] appearance-none cursor-pointer"
                    disabled={loading}
                  >
                    <option value="all">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>

                <div className="w-full md:w-40 relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#035670] appearance-none cursor-pointer"
                    disabled={loading}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="joinedAt">Sort by Join Date</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#035670] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label="Grid view"
                  disabled={loading}
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md cursor-pointer ${
                    viewMode === "list"
                      ? "bg-[#035670] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label="List view"
                  disabled={loading}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Content Area: Only this changes based on loading/error/empty */}
        <div className="w-full h-full mt-4">
          {loading ? (
            viewMode === "grid" ? (
              <ShimmerGrid />
            ) : (
              <ShimmerList />
            )
          ) : error ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchDoctors}
                className="px-4 py-2 bg-[#035670] text-white rounded-md hover:bg-[#066885]"
              >
                Retry Loading
              </button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <EmptyState />
          ) : viewMode === "grid" ? (
            <DoctorsTileView
              doctors={filteredDoctors}
              onEdit={setEditingDoctor}
              onDelete={setDoctorToDelete}
              onScheduleUpdate={handleScheduleUpdated}
            />
          ) : (
            <DoctorsListView
              doctors={filteredDoctors}
              onEdit={setEditingDoctor}
              onDelete={setDoctorToDelete}
              onScheduleUpdate={handleScheduleUpdated}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddDoctorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchDoctors}
      />

      <EditDoctorModal
        isOpen={!!editingDoctor}
        onClose={() => setEditingDoctor(null)}
        onSuccess={fetchDoctors}
        doctor={editingDoctor}
      />

      <DeleteConfirmationModal
        isOpen={!!doctorToDelete}
        onClose={() => setDoctorToDelete(null)}
        onSuccess={fetchDoctors}
        doctorId={doctorToDelete?.id || ""}
        doctorName={doctorToDelete?.name || ""}
      />
    </div>
  );
};

export default ManageDoctors;
