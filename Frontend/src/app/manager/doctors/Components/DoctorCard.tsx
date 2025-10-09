"use client";

import React, { useState } from "react";
import { Edit, Trash2, CalendarPlus, CalendarCheck } from "lucide-react";
import { Doctor } from "../ManageDoctors";
import ViewSlotsModal from "../Modals/ViewSlotsModal";
import AddSlotsModal from "../Modals/AddSlotsModal";

interface DoctorCardProps {
  doctor: Doctor;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
  onScheduleUpdate?: () => void;
}

const DoctorCard = ({
  doctor,
  onEdit,
  onDelete,
  onScheduleUpdate,
}: DoctorCardProps) => {
  const [isAddSlotsOpen, setIsAddSlotsOpen] = useState(false);
  const [isViewSlotsOpen, setIsViewSlotsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-400 overflow-hidden tracking-tighter">
      <div className="p-5">
        {/* Profile Image */}
        <div className="flex justify-center mb-4 relative">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-400 shadow-sm overflow-hidden">
            <img
              src={doctor.image || "/media/PlaceholderDoctorImage.png"}
              alt={doctor.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/media/PlaceholderDoctorImage.png";
              }}
            />
          </div>
          <div className="absolute top-0 right-0 flex gap-1">
            <button
              onClick={() => onEdit(doctor)}
              className="p-1.5 bg-white/60 rounded-full hover:bg-white hover:border hover:border-gray-400 duration-200 ease-in-out border border-gray-200 transition-colors cursor-pointer"
              aria-label="Edit doctor"
            >
              <Edit size={12} className="text-[#035670]" />
            </button>
            <button
              onClick={() => onDelete(doctor)}
              className="p-1.5 bg-white/60 rounded-full hover:bg-white hover:border hover:border-gray-400 duration-200 ease-in-out border border-gray-200 transition-colors cursor-pointer"
              aria-label="Delete doctor"
            >
              <Trash2 size={12} className="text-red-500" />
            </button>
          </div>
        </div>

        {/* Info */}
        <h3 className="font-semibold text-gray-900 text-lg text-center">
          Dr. {doctor.name}
        </h3>
        <p className="text-sm text-[#035670] font-medium mt-1 text-center">
          {doctor.specialization}
        </p>

        <div className="mt-4 space-y-2.5 text-sm text-gray-700">
          <div className="flex">
            <span className="font-medium w-20 flex-shrink-0">Email:</span>
            <span className="truncate">{doctor.user?.email || "N/A"}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20 flex-shrink-0">Phone:</span>
            <span>{doctor.phoneNumber}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20 flex-shrink-0">Joined:</span>
            <span>
              {new Date(doctor.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>
        </div>

        {/* Slot Buttons */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => setIsAddSlotsOpen(true)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-[#035670] text-white text-xs rounded-md hover:bg-[#066885] transition-colors cursor-pointer duration-200 ease-in-out"
          >
            <CalendarPlus size={12} />
            Add Slots
          </button>
          <button
            onClick={() => setIsViewSlotsOpen(true)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors cursor-pointer duration-200 ease-in-out"
          >
            <CalendarCheck size={12} />
            View Slots
          </button>
        </div>
      </div>

      <AddSlotsModal
        isOpen={isAddSlotsOpen}
        onClose={() => setIsAddSlotsOpen(false)}
        doctorId={doctor.id}
        currentSchedule={doctor.schedule || {}}
        onSuccess={onScheduleUpdate}
      />

      <ViewSlotsModal
        isOpen={isViewSlotsOpen}
        onClose={() => setIsViewSlotsOpen(false)}
        schedule={doctor.schedule || {}}
      />
    </div>
  );
};

export default DoctorCard;
