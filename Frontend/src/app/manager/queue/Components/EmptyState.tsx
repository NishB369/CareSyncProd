"use client";

import { UserCheck, UserPlus } from "lucide-react";
import React, { useState } from "react";
import AddToQueueModal from "../Modals/AddToQueueModal";
import AddAppointmentModal from "../../appointments/Modals/AddApointmentModal";

const EmptyState = () => {
  const [isAddtoQueueModalOpen, setIsAddtoQueueModalOpen] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  return (
    <div className="py-32 border rounded-xl h-full w-full flex flex-col items-center justify-center gap-6 px-40 bg-gray-50">
      <div className="font-light tracking-tighter flex flex-col items-center justify-center text-center gap-1">
        <h1 className="text-3xl">
          No Patients <span className="font-medium">added in Queue yet.</span>
        </h1>
        <h2 className="w-2/3 leading-tight text-sm">
          Get started by adding first patient. Patient can either have a Booked
          Appointment or can be a Walk-In Patient.
        </h2>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div
          className="bg-[#035670] px-14 py-10 rounded-md border border-black flex flex-col items-center justify-center gap-2 text-white cursor-pointer hover:opacity-80 transition duration-200 ease-in-out group shadow-md"
          onClick={() => setIsAddtoQueueModalOpen(true)}
        >
          <UserCheck
            size={36}
            className="group-hover:mb-1 duration-200 ease-in-out"
          />
          <h1>Have Appointment Patient</h1>
        </div>

        <div
          className="bg-white px-14 py-10 rounded-md border border-black flex flex-col items-center justify-center gap-2 text-[#035670] cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out group shadow-md"
          onClick={() => setIsWalkInModalOpen(true)}
        >
          <UserPlus
            size={36}
            className="group-hover:mb-1 duration-200 ease-in-out"
          />
          <h1>Walk-In Patient</h1>
        </div>
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

export default EmptyState;
