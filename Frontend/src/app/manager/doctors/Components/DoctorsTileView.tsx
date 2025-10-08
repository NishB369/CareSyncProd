// ./Components/DoctorsTileView.tsx

import React from "react";
import DoctorCard from "./DoctorCard";
import { Doctor } from "../ManageDoctors";

interface DoctorsTileViewProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
  onScheduleUpdate: () => void; // ✅ Renamed from onUpdateSchedule
}

const DoctorsTileView = ({
  doctors,
  onEdit,
  onDelete,
  onScheduleUpdate, // ✅ Updated
}: DoctorsTileViewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor.id}
          doctor={doctor}
          onEdit={onEdit}
          onDelete={onDelete}
          onScheduleUpdate={onScheduleUpdate} // ✅ Pass the new prop
        />
      ))}
    </div>
  );
};

export default DoctorsTileView;
