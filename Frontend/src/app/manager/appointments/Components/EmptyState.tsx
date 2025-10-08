"use client";

import { PlusCircle } from "lucide-react";
import React, { useState } from "react";
import AddAppointmentModal from "../Modals/AddApointmentModal";

const EmptyState = () => {
  const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] =
    useState(false);

  return (
    <div className="py-24 border rounded-xl h-full w-full flex flex-col items-center justify-center gap-6 px-40 bg-gray-50">
      <div className="font-light tracking-tighter flex flex-col items-center justify-center text-center gap-1">
        <h1 className="text-3xl">
          No Appointments <span className="font-medium">scheduled yet.</span>
        </h1>
        <h2 className="w-2/3 leading-tight text-sm">
          Get started by adding your first appointment. You can manage all
          appointments here.
        </h2>
      </div>

      <div
        className="bg-[#035670] px-14 py-10 rounded-md border border-black flex flex-col items-center justify-center gap-2 text-white cursor-pointer hover:opacity-80 transition duration-200 ease-in-out group shadow-lg"
        onClick={() => setIsAddAppointmentModalOpen(true)}
      >
        <PlusCircle
          size={36}
          className="group-hover:mb-1 duration-200 ease-in-out"
        />
        <h1>
          <span className="font-medium">Add</span> Appointment
        </h1>
      </div>

      <AddAppointmentModal
        isOpen={isAddAppointmentModalOpen}
        onClose={() => setIsAddAppointmentModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};

export default EmptyState;
