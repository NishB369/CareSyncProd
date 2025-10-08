"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";

// Define types matching your backend
type Doctor = {
  id: string;
  name: string;
  specialization: string;
  location: string;
};

type Gender = "MALE" | "FEMALE" | "OTHER";

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  forQueue?: boolean;
}

const AddAppointmentModal = ({
  isOpen,
  onClose,
  onSuccess,
  forQueue = false,
}: AddAppointmentModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    issue: "",
    address: "",
    age: "",
    gender: "OTHER" as Gender,
    isUrgent: false,
  });
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const NOW = new Date();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDoctor(null);
      setSelectedDate(undefined);
      setCurrentDate(new Date());
      setSelectedSlot(null);
      setPatientInfo({
        name: "",
        email: "",
        phone: "",
        issue: "",
        address: "",
        age: "",
        gender: "OTHER",
        isUrgent: false,
      });
      setErrors({});
      setViewMode("grid");
    }
  }, [isOpen]);

  // Fetch doctors when modal opens
  useEffect(() => {
    if (isOpen && step === 1) {
      const fetchDoctors = async () => {
        setLoadingDoctors(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/doctor/all-doctors`,
            {
              credentials: "include",
            }
          );
          const data = await res.json();
          if (data.success) {
            const mappedDoctors: Doctor[] = data.data.map((doc: any) => ({
              id: doc.id,
              name: doc.name,
              specialization: doc.specialization,
              location: doc.clinicAddress || "Clinic",
            }));
            setDoctors(mappedDoctors);
          } else {
            setErrors({ doctors: "Failed to load doctors" });
          }
        } catch (err) {
          console.error("Error fetching doctors:", err);
          setErrors({ doctors: "Network error" });
        } finally {
          setLoadingDoctors(false);
        }
      };
      fetchDoctors();
    }
  }, [isOpen, step]);

  // Fetch available slots when moving to step 3
  useEffect(() => {
    if (step === 3 && selectedDoctor && selectedDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          // Format date as YYYY-MM-DD without timezone conversion
          const dateStr =
            selectedDate.getFullYear() +
            "-" +
            String(selectedDate.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(selectedDate.getDate()).padStart(2, "0");
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/doctor/${selectedDoctor.id}/slots?date=${dateStr}`,
            {
              credentials: "include",
            }
          );
          const data = await res.json();
          if (data.success) {
            const parsedSlots = (data.data || []).map((slotStr: string) => {
              // Split on the dash that separates start and end
              const [startPart, endPart] = slotStr.split("-");

              const parseTime12 = (timeStr: string): Date => {
                // timeStr example: "9:00AM", "12:30PM", "1:45PM"
                const match = timeStr.trim().match(/(\d{1,2}):(\d{2})(AM|PM)/i);
                if (!match) {
                  console.warn("Invalid time format:", timeStr);
                  // fallback: return current date with 00:00
                  const d = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    0,
                    0,
                    0,
                    0
                  );
                  return d;
                }

                const parts = match;
                const hoursStr = parts[1];
                const minutesStr = parts[2];
                let period = parts[3];
                let hours = parseInt(hoursStr, 10);
                const minutes = parseInt(minutesStr, 10);
                period = period.toUpperCase();

                // Convert to 24-hour
                if (period === "AM" && hours === 12) {
                  hours = 0; // 12:xx AM → 00:xx
                } else if (period === "PM" && hours !== 12) {
                  hours += 12; // 1-11 PM → 13-23
                }
                // 12:xx PM stays 12

                const d = new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate(),
                  hours,
                  minutes,
                  0,
                  0
                );
                return d;
              };

              return {
                start: parseTime12(startPart),
                end: parseTime12(endPart),
              };
            });
            setAvailableSlots(parsedSlots);
          } else {
            setAvailableSlots([]);
          }
        } catch (err) {
          console.error("Error fetching slots:", err);
          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [step, selectedDoctor, selectedDate]);

  const [availableSlots, setAvailableSlots] = useState<
    { start: Date; end: Date }[]
  >([]);

  const validatePatientInfo = () => {
    const newErrors: Record<string, string> = {};
    if (!patientInfo.name.trim()) newErrors.name = "Name is required";
    if (!patientInfo.phone.trim()) newErrors.phone = "Phone is required";
    if (!patientInfo.issue.trim()) newErrors.issue = "Issue is required";
    if (!patientInfo.address.trim()) newErrors.address = "Address is required";
    if (!patientInfo.age) newErrors.age = "Age is required";

    const phone = patientInfo.phone.replace(/[\s\-\(\)]/g, "");
    const indianPhoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
    if (phone && !indianPhoneRegex.test(phone)) {
      newErrors.phone = "Invalid Indian phone number";
    }

    const age = parseInt(patientInfo.age);
    if (age && (isNaN(age) || age < 1 || age > 120)) {
      newErrors.age = "Age must be between 1–120";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validatePatientInfo()) return;

    setIsSubmitting(true);
    try {
      // Format time as "9:00AM" or "12:30PM"
      const formatTime = (date: Date): string => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, "0");
        return `${displayHours}:${displayMinutes}${period}`;
      };

      const slotStr = `${formatTime(selectedSlot!.start)}-${formatTime(
        selectedSlot!.end
      )}`;

      // Format appointmentDate as YYYY-MM-DD
      const appointmentDate =
        selectedDate!.getFullYear() +
        "-" +
        String(selectedDate!.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(selectedDate!.getDate()).padStart(2, "0");

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointment/schedule`,
        {
          doctorId: selectedDoctor!.id,
          slot: slotStr,
          appointmentDate,
          queueType: patientInfo.isUrgent ? "EMERGENCY" : "APPOINTMENT",
          patientName: patientInfo.name,
          patientEmail: patientInfo.email || null,
          patientPhoneNumber: patientInfo.phone.replace(/[\s\-\(\)]/g, ""),
          patientIssue: patientInfo.issue,
          patientAddress: patientInfo.address,
          patientAge: patientInfo.age,
          patientGender: patientInfo.gender,
        },
        { withCredentials: true }
      );

      setStep(5);
      onSuccess?.();
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error("Failed to schedule appointment", error);
      setErrors({ submit: "Failed to book appointment. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const renderStep1 = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Select a Doctor</h3>
        <div className="flex bg-gray-100 rounded-md p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 text-xs rounded-md cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#035670] text-white shadow-sm"
                : "text-gray-600"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 text-xs rounded-md cursor-pointer ${
              viewMode === "table"
                ? "bg-[#035670] text-white shadow-sm"
                : "text-gray-600"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {loadingDoctors ? (
        <div className="text-center py-4">Loading doctors...</div>
      ) : errors.doctors ? (
        <div className="text-center py-4 text-red-600">{errors.doctors}</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                setSelectedDoctor(doc);
                setStep(2);
              }}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <Stethoscope className="text-[#035670] mb-2 group-hover:scale-110 duration-200 ease-in-out" />
              <h4 className="font-medium">{doc.name}</h4>
              <p className="text-sm text-gray-600">{doc.specialization}</p>
              <p className="text-xs text-gray-500">{doc.location}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 font-medium">Doctor</th>
                <th className="pb-2 font-medium">Specialization</th>
                <th className="pb-2 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setStep(2);
                  }}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-3 font-medium">{doc.name}</td>
                  <td className="py-3 text-gray-600">{doc.specialization}</td>
                  <td className="py-3 text-gray-600">{doc.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => {
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const changeMonth = (delta: number) => {
      const newDate = new Date(currentYear, currentMonth + delta, 1);
      setCurrentDate(newDate);
    };

    const selectDate = (day: number | null) => {
      if (!day) return;
      const selected = new Date(currentYear, currentMonth, day);
      if (
        selected <
        new Date(today.getFullYear(), today.getMonth(), today.getDate())
      ) {
        return;
      }
      setSelectedDate(selected);
    };

    const isDateSelected = (day: number | null) => {
      if (!day || !selectedDate) return false;
      return (
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear
      );
    };

    const isDateDisabled = (day: number | null) => {
      if (!day) return true;
      const date = new Date(currentYear, currentMonth, day);
      return (
        date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      );
    };

    const isToday = (day: number | null) => {
      if (!day) return false;
      return (
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear()
      );
    };

    return (
      <div className="p-6">
        <button
          onClick={() => setStep(1)}
          className="flex items-center text-sm text-[#035670] mb-4 cursor-pointer hover:underline"
        >
          <ChevronLeft size={16} /> Back to doctors
        </button>
        <h3 className="text-lg font-medium mb-4">Select Date</h3>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-[#035670]">
              {monthNames[currentMonth]} {currentYear}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <ChevronLeft size={20} className="text-[#035670]" />
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <ChevronRight size={20} className="text-[#035670]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}

            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => selectDate(day)}
                disabled={isDateDisabled(day)}
                className={`
                  py-2 text-sm rounded cursor-pointer relative
                  ${!day ? "invisible" : ""}
                  ${
                    isDateDisabled(day)
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-[#035670] hover:bg-gray-100"
                  }
                  ${
                    isDateSelected(day)
                      ? "bg-[#035670] text-white hover:bg-[#035670]"
                      : ""
                  }
                  ${
                    isToday(day) && !isDateSelected(day)
                      ? "border-2 border-[#035670] font-semibold"
                      : ""
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <button
            onClick={() => setStep(3)}
            className="mt-4 w-full py-2 bg-[#035670] text-white rounded-md hover:bg-[#066885] cursor-pointer"
          >
            Continue to Time Slots
          </button>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="p-6">
      <button
        onClick={() => setStep(2)}
        className="flex items-center text-sm text-[#035670] mb-4 cursor-pointer hover:underline"
      >
        <ChevronLeft size={16} /> Back to date
      </button>
      <h3 className="text-lg font-medium mb-4">
        Select Time Slot — {selectedDate?.toDateString()}
      </h3>

      {loadingSlots ? (
        <p className="text-center py-2">Loading available slots...</p>
      ) : availableSlots.length === 0 ? (
        <p className="text-center py-2 text-gray-500">
          No available slots on this date.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {availableSlots.map((slot, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedSlot(slot);
                setStep(4);
              }}
              className={`px-3 py-2 rounded-full text-sm font-medium cursor-pointer ${
                selectedSlot?.start.getTime() === slot.start.getTime()
                  ? "bg-[#035670] text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {slot.start.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleConfirm();
      }}
      className="p-6 space-y-4"
    >
      <button
        type="button"
        onClick={() => setStep(3)}
        className="flex items-center text-sm text-[#035670] mb-4 cursor-pointer hover:underline"
      >
        <ChevronLeft size={16} /> Back to slots
      </button>
      <h3 className="text-lg font-medium mb-4">Confirm Appointment</h3>

      <div className="bg-gray-50 p-4 rounded-lg text-sm">
        <p>
          <strong>Doctor:</strong> {selectedDoctor?.name} (
          {selectedDoctor?.specialization})
        </p>
        <p>
          <strong>Date:</strong> {selectedDate?.toDateString()}
        </p>
        <p>
          <strong>Time:</strong>{" "}
          {selectedSlot?.start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          –{" "}
          {selectedSlot?.end.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Patient Name *
          </label>
          <input
            type="text"
            value={patientInfo.name}
            onChange={(e) =>
              setPatientInfo({ ...patientInfo, name: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md ${
              errors.name ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Nishchay Bhatia"
          />
          {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={patientInfo.email}
            onChange={(e) =>
              setPatientInfo({ ...patientInfo, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="nishchay@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone *</label>
          <input
            type="tel"
            value={patientInfo.phone}
            onChange={(e) =>
              setPatientInfo({ ...patientInfo, phone: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md ${
              errors.phone ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="+91 98765 43210"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Age *</label>
          <input
            type="number"
            value={patientInfo.age}
            onChange={(e) =>
              setPatientInfo({ ...patientInfo, age: e.target.value })
            }
            min="1"
            max="120"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.age ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="20"
          />
          {errors.age && <p className="text-red-600 text-sm">{errors.age}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Medical Issue *
          </label>
          <textarea
            value={patientInfo.issue}
            onChange={(e) =>
              setPatientInfo({ ...patientInfo, issue: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md ${
              errors.issue ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Describe the patient's issue..."
            rows={2}
          />
          {errors.issue && (
            <p className="text-red-600 text-sm">{errors.issue}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address *</label>
          <input
            type="text"
            value={patientInfo.address}
            onChange={(e) =>
              setPatientInfo({ ...patientInfo, address: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md ${
              errors.address ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="123 Main St, City"
          />
          {errors.address && (
            <p className="text-red-600 text-sm">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gender *</label>
          <select
            value={patientInfo.gender}
            onChange={(e) =>
              setPatientInfo({
                ...patientInfo,
                gender: e.target.value as Gender,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other / Prefer not to say</option>
          </select>
        </div>

        {forQueue && (
          <div className="md:col-span-2">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={patientInfo.isUrgent}
                onChange={(e) =>
                  setPatientInfo({
                    ...patientInfo,
                    isUrgent: e.target.checked,
                  })
                }
                className="mt-1 mr-2 h-4 w-4 text-[#035670] rounded focus:ring-[#035670]"
              />
              <span className="text-sm font-medium text-gray-700">
                Mark as urgent case
                <span className="ml-1 text-xs text-gray-500">
                  (Priority queue)
                </span>
              </span>
            </label>
            {patientInfo.isUrgent && (
              <div className="mt-2 flex items-start p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  This appointment will be prioritized in the queue. Only select
                  if medically necessary.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {errors.submit && (
        <p className="text-red-600 text-sm text-center">{errors.submit}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2.5 mt-2 rounded-md font-medium text-white cursor-pointer ${
          isSubmitting ? "bg-gray-400" : "bg-[#035670] hover:bg-[#066885]"
        }`}
      >
        {isSubmitting ? "Confirming..." : "Confirm Appointment"}
      </button>
    </form>
  );

  const renderStep5 = () => (
    <div className="p-6 text-center">
      <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-12 h-12 text-green-600 animate-pulse" />
      </div>
      <p className="text-gray-700 text-2xl">
        Appointment booked for <strong>{patientInfo.name}</strong>!
      </p>
      {forQueue && patientInfo.isUrgent && (
        <p className="text-yellow-600 mt-2 flex items-center justify-center">
          <AlertTriangle className="mr-1" size={16} />
          Marked as urgent priority
        </p>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4 w-full"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-wizard-title"
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl border border-gray-300 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h2
            id="appointment-wizard-title"
            className="text-xl font-semibold text-gray-800"
          >
            {step === 5 ? "Success!" : "Book Appointment"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 rounded-full p-1 cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>
    </div>
  );
};

export default AddAppointmentModal;
