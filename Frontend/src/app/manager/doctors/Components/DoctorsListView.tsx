import React, { useState, useMemo } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Doctor } from "../ManageDoctors";
import AddSlotsModal from "../Modals/AddSlotsModal";
import ViewSlotsModal from "../Modals/ViewSlotsModal";

interface DoctorsListViewProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
  onScheduleUpdate: () => void; // ✅ Renamed and simplified
}

const DoctorsListView = ({
  doctors,
  onEdit,
  onDelete,
  onScheduleUpdate, // ✅
}: DoctorsListViewProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [openModals, setOpenModals] = useState<
    Record<string, "add" | "view" | null>
  >({});

  const totalPages = Math.ceil(doctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDoctors = useMemo(() => {
    return doctors.slice(startIndex, startIndex + itemsPerPage);
  }, [doctors, startIndex, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (totalPages <= 1) return [];

    rangeWithDots.push(1);
    if (currentPage - delta > 2) rangeWithDots.push("...");
    rangeWithDots.push(...range);
    if (currentPage + delta < totalPages - 1) rangeWithDots.push("...");
    if (totalPages > 1) rangeWithDots.push(totalPages);

    return rangeWithDots;
  };

  const handleOpenModal = (doctorId: string, type: "add" | "view") => {
    setOpenModals((prev) => ({ ...prev, [doctorId]: type }));
  };

  const handleCloseModal = (doctorId: string) => {
    setOpenModals((prev) => ({ ...prev, [doctorId]: null }));
  };

  return (
    <div className="bg-white rounded-md border overflow-hidden tracking-tighter">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentDoctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover border"
                        src={
                          doctor.image || "/media/PlaceholderDoctorImage.png"
                        }
                        alt={doctor.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/media/PlaceholderDoctorImage.png";
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Dr. {doctor.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {doctor.user?.email || "N/A"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {doctor.phoneNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    Joined:{" "}
                    {new Date(doctor.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {doctor.specialization}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(doctor.id, "add")}
                      className="text-xs bg-[#035670] text-white px-2 py-1 rounded hover:bg-[#066885] transition-colors cursor-pointer duration-200 ease-in-out"
                    >
                      Add Slots
                    </button>
                    <button
                      onClick={() => handleOpenModal(doctor.id, "view")}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer duration-200 ease-in-out"
                    >
                      View Slots
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(doctor)}
                    className="text-[#035670] hover:text-[#066885] mr-3 cursor-pointer duration-200 ease-in-out"
                    aria-label="Edit doctor"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(doctor)}
                    className="text-red-600 hover:text-red-900 cursor-pointer duration-200 ease-in-out"
                    aria-label="Delete doctor"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentDoctors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No doctors found.
          </div>
        )}
      </div>

      {/* Modals */}
      {currentDoctors.map((doctor) => (
        <React.Fragment key={doctor.id}>
          <AddSlotsModal
            isOpen={openModals[doctor.id] === "add"}
            onClose={() => handleCloseModal(doctor.id)}
            doctorId={doctor.id}
            currentSchedule={doctor.schedule || {}}
            onSuccess={onScheduleUpdate} // ✅ Use onSuccess, not onSave
          />
          <ViewSlotsModal
            isOpen={openModals[doctor.id] === "view"}
            onClose={() => handleCloseModal(doctor.id)}
            schedule={doctor.schedule || {}}
          />
        </React.Fragment>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
          <div className="flex items-center mb-4 sm:mb-0">
            <span className="text-sm text-gray-700 mr-2">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#035670]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="text-sm text-gray-700 mb-4 sm:mb-0">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {getPageNumbers().map((page, index) =>
                typeof page === "number" ? (
                  <button
                    key={index}
                    onClick={() => goToPage(page)}
                    className={`w-8 h-8 rounded-md text-sm font-medium ${
                      currentPage === page
                        ? "bg-[#035670] text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="px-1 text-gray-500">
                    {page}
                  </span>
                )
              )}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsListView;
