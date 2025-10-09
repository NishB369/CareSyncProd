import { CheckCircleIcon } from "lucide-react";
import { Appointment } from "../ManageAppointments";

type AppointmentCardProps = {
  apt: Appointment;
  onCancel?: () => void;
  onReschedule: () => void;
};

const AppointmentCard = ({
  apt,
  onCancel,
  onReschedule,
}: AppointmentCardProps) => {
  const now = new Date();
  const startTime = new Date(apt.startTime);
  const hoursUntil = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  const canCancel = hoursUntil > 6;
  const canReschedule = hoursUntil > 12;

  const getGenderDisplay = (gender: string | undefined) => {
    if (!gender) return "N/A";
    return gender === "male" ? "M" : gender === "female" ? "F" : "Other";
  };

  const getDoctorInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      key={apt.id}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4 px-6"
    >
      {/* Date, Time & Appointment Code */}
      <div className="min-w-[120px] text-center sm:text-left">
        <div className="text-sm text-gray-500">
          {startTime.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </div>
        <div className="font-bold text-lg">
          {startTime.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="mt-1 text-xs font-mono text-white bg-[#035670] px-2 py-0.5 rounded inline-block">
          {apt.appointmentCode}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-12 bg-gray-200 ml-4 mx-2"></div>

      {/* Patient Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-medium">{apt.patient.name}</div>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
            {getGenderDisplay(apt.patient.gender)}
          </span>
        </div>
        <div className="text-xs text-gray-600 truncate my-1">
          {apt.patient.phone} • Age: {apt.patient.age}
        </div>
        {apt.patient.issue && (
          <div className="text-sm text-gray-500truncate">
            {apt.patient.issue.length > 30
              ? `${apt.patient.issue.substring(0, 30)}...`
              : apt.patient.issue}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-12 bg-gray-200 -ml-24 mr-2"></div>

      {/* Doctor Details */}
      <div className="flex-1 min-w-0 flex items-center gap-2 scale-105 pl-3">
        {/* Doctor Image or Initials */}
        <div className="relative">
          {apt.doctor.image ? (
            <img
              src={apt.doctor.image}
              alt={apt.doctor.name}
              className="w-10 h-10 rounded-full object-cover border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border">
              <span className="text-sm font-medium text-gray-600">
                {getDoctorInitials(apt.doctor.name)}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate">Dr. {apt.doctor.name}</div>
          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
            {apt.doctor.specialization}
          </span>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        {apt.status === "COMPLETED" ? (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1 whitespace-nowrap">
            <CheckCircleIcon className="w-4 h-4" /> Completed
          </span>
        ) : apt.status === "CANCELLED" ? (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full line-through whitespace-nowrap">
            Cancelled
          </span>
        ) : apt.status === "RESCHEDULED" ? (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full whitespace-nowrap">
            Rescheduled
          </span>
        ) : (
          <>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">
              {apt.status} {/* e.g., "BOOKED" */}
            </span>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                disabled={!canCancel}
                title={!canCancel ? "Too late to cancel (within 6 hours)" : ""}
                className={`text-sm font-medium px-2 py-1 rounded whitespace-nowrap ${
                  canCancel
                    ? "text-red-600 hover:underline cursor-pointer duration-200 ease-in-out"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={onReschedule}
                disabled={!canReschedule}
                title={
                  !canReschedule
                    ? "Too late to reschedule (within 12 hours)"
                    : ""
                }
                className={`text-sm font-medium px-2 py-1 rounded whitespace-nowrap ${
                  canReschedule
                    ? "text-[#035670] hover:underline cursor-pointer duration-200 ease-in-out"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                Reschedule
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
