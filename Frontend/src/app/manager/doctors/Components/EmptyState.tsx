"use client";

import AddDoctorModal from "../Modals/AddDoctorModal";

import { PlusCircle } from "lucide-react";
import React, { useState } from "react";

const EmptyState = () => {
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);

  return (
    <div className="py-40 border rounded-xl h-full w-full flex flex-col items-center justify-center gap-6 px-40 bg-gray-50">
      <div className="font-light tracking-tighter flex flex-col items-center justify-center text-center gap-1">
        <h1 className="text-3xl">
          No doctors <span className="font-medium">added yet.</span>
        </h1>
        <h2 className="w-2/3 leading-tight text-sm">
          Get started by adding your first doctor. You can add them individually
          or upload in bulk.
        </h2>
      </div>

      <div
        className="bg-[#035670] px-14 py-10 rounded-md border border-black flex flex-col items-center justify-center gap-2 text-white cursor-pointer hover:opacity-80 transition duration-200 ease-in-out group shadow-lg tracking-tighter font-light text-xl"
        onClick={() => setIsAddDoctorModalOpen(true)}
      >
        <PlusCircle
          size={36}
          className="group-hover:mb-1 duration-200 ease-in-out"
        />
        <h1>
          <span className="font-medium">Add</span> Doctor
        </h1>
      </div>

      <AddDoctorModal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default EmptyState;
