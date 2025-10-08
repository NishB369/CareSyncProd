"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  CheckCircle,
  ChevronDown,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { Doctor } from "../ManageDoctors";

interface EditDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  doctor: Doctor | null;
}

const EditDoctorModal = ({
  isOpen,
  onClose,
  onSuccess,
  doctor,
}: EditDoctorModalProps) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const IMAGE_SIZE_LIMIT = 2 * 1024 * 1024;

  // Initialize form when doctor changes
  useEffect(() => {
    if (isOpen && doctor) {
      setName(doctor.name);
      setPhoneNumber(doctor.phoneNumber);
      setSpecialization(doctor.specialization);
      setGender(doctor.gender);
      setIsAvailable(doctor.isAvailable);
      setImageUrl(doctor.image);
      setCurrentImageUrl(doctor.image);
      setErrors({});
      setSubmitSuccess(false);
      setImageFile(null);
    }
  }, [isOpen, doctor]);

  if (!isOpen || !doctor) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone is required";
    else {
      const clean = phoneNumber.replace(/[\s\-\(\)]/g, "");
      if (!/^(\+91|0)?[6-9]\d{9}$/.test(clean))
        newErrors.phoneNumber = "Enter a valid Indian phone number";
    }
    if (!specialization.trim())
      newErrors.specialization = "Specialization is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > IMAGE_SIZE_LIMIT) {
        setErrors((prev) => ({ ...prev, image: "Image must be under 2MB" }));
        return;
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Only JPG/PNG images allowed",
        }));
        return;
      }
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      //   setErrors((prev) => ({ ...prev, image: undefined }));
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImageUrl(currentImageUrl); // revert to original
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phoneNumber", phoneNumber);
    formData.append("gender", gender);
    formData.append("specialization", specialization);
    formData.append("isAvailable", String(isAvailable));

    // Only send image if changed
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/doctor/edit/${doctor.id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSubmitSuccess(true);
        onSuccess?.();

        setTimeout(() => {
          setSubmitSuccess(false);
          onClose();
        }, 1500);
      } else {
        setErrors({
          submit: response.data.message || "Failed to update doctor",
        });
      }
    } catch (err: any) {
      console.error("Edit doctor error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update doctor. Please try again.";
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4 tracking-tighter"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-doctor-modal-title"
    >
      <div
        className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-300 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h2
            id="edit-doctor-modal-title"
            className="text-xl font-semibold text-gray-800"
          >
            {submitSuccess
              ? "Success!"
              : `Edit Dr. ${doctor.name.split(" ")[0]}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 rounded-full p-1 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-700">Doctor updated successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Photo
              </label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {imageUrl ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover mx-auto border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/media/PlaceholderDoctorImage.png";
                        }}
                      />
                      {imageUrl !== currentImageUrl && (
                        <button
                          type="button"
                          onClick={handleImageRemove}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                          aria-label="Remove new image"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {imageFile ? imageFile.name : "Current photo"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="text-gray-500" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        JPG or PNG, max 2MB
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 bg-[#035670] font-medium hover:opacity-80 duration-200 ease-in-out cursor-pointer text-white text-xs px-4 py-2 rounded-sm"
                      >
                        Upload New Image
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-[#035670]"
                  }`}
                  placeholder="Dr. Priya Sharma"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              {/* Phone */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.phoneNumber
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-[#035670]"
                  }`}
                  placeholder="+91 98765 43210"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
              {/* Specialization */}
              <div>
                <label
                  htmlFor="specialization"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Specialization *
                </label>
                <input
                  type="text"
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.specialization
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-[#035670]"
                  }`}
                  placeholder="Cardiology, Orthopedics, Pediatrics"
                />
                {errors.specialization && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.specialization}
                  </p>
                )}
              </div>
              {/* Gender */}
              <div className="relative">
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Gender *
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
                    errors.gender
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-[#035670]"
                  }`}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 mt-1 w-4 h-4 pointer-events-none" />
              </div>
              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability Status
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 text-[#035670] focus:ring-[#035670] border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="isAvailable"
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {isAvailable
                      ? "Available for appointments"
                      : "Not available"}
                  </label>
                </div>
              </div>
            </div>

            {/* Global Error */}
            {errors.submit && (
              <p className="text-red-600 text-sm text-center">
                {errors.submit}
              </p>
            )}
            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 px-4 rounded-md font-medium text-white transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#035670] hover:bg-[#066885] cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating Doctor...
                  </span>
                ) : (
                  "Update Doctor"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditDoctorModal;
