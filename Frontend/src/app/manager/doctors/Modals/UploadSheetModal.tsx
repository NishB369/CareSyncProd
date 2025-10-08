"use client";

import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import SchemaHelpModal from "./SchemaHelpModal";

interface UploadSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadSheetModal = ({ isOpen, onClose }: UploadSheetModalProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSchemaHelp, setShowSchemaHelp] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const schemaInfo = {
    title: "Doctor Data Upload Schema",
    columns: ["Name", "Email", "Phone", "Specialization", "License Number"],
    sampleRow: [
      "Dr. Jane Smith",
      "jane@clinic.com",
      "+1234567890",
      "Cardiology",
      "LIC-12345",
    ],
    columnDescriptions: [
      { key: "Name", description: "Full name of the doctor" },
      { key: "Email", description: "Professional email address" },
      { key: "Phone", description: "Contact number with country code" },
      { key: "Specialization", description: "Medical specialty" },
      { key: "License Number", description: "Valid medical license ID" },
    ],
    guidelines: [
      "Ensure all emails are unique",
      "Phone numbers must include country code",
      "Do not include header row",
    ],
    commonIssues: [
      "Missing required fields",
      "Duplicate email addresses",
      "Invalid phone format",
    ],
    downloadLink: "/templates/doctors_template.xlsx",
  };

  const validExtensions = [".xls", ".xlsx"];
  const fileSizeLimit = 10 * 1024 * 1024;

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    handleFiles(files);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const isValidType = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isValidType) {
      setUploadStatus("error");
      setErrorMessage(
        `Invalid file type. Only ${validExtensions.join(
          ", "
        )} files are allowed.`
      );
      setUploadedFile(null);
      return;
    }

    if (file.size > fileSizeLimit) {
      setUploadStatus("error");
      setErrorMessage(
        `File size exceeds ${fileSizeLimit / 1024 / 1024}MB limit`
      );
      setUploadedFile(null);
      return;
    }

    setUploadedFile(file);
    setUploadStatus("idle");
    setErrorMessage("");
  };

  const removeFile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUploadedFile(null);
    setUploadStatus("idle");
    setErrorMessage("");
    setSuccessMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!uploadedFile) return;

    setUploadStatus("uploading");

    setTimeout(() => {
      const isSuccess = true;
      if (isSuccess) {
        setUploadStatus("success");
        setSuccessMessage("Doctors data uploaded successfully!");
      } else {
        setUploadStatus("error");
        setErrorMessage("Failed to process the file. Please check the format.");
      }
    }, 1500);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-300 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="border-b border-gray-200 p-4 flex justify-between items-center tracking-tighter">
          <h2
            id="upload-modal-title"
            className="text-xl font-semibold text-gray-800"
          >
            Upload Doctors Spreadsheet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 rounded-full p-1 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <button
              onClick={() => setShowSchemaHelp(true)}
              className="text-white px-2.5 py-2.5 hover:bg-[#3098a1] transition-colors cursor-pointer bg-[#035670] duration-200 ease-in-out shadow-md absolute z-10 right-0 top-0 rounded-b-full rounded-l-full"
              aria-label="View schema help"
            >
              <HelpCircle size={18} />
            </button>

            <div
              className={`relative border-2 border-dashed rounded-lg py-6 px-6 text-center transition-all duration-200 ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : uploadStatus === "error"
                  ? "border-red-300 bg-red-50"
                  : uploadStatus === "success"
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              {uploadStatus === "success" ? (
                <div className="space-y-2 tracking-tighter">
                  <CheckCircle className="text-green-500 mx-auto" size={48} />
                  <h3 className="text-lg font-semibold text-green-700">
                    Upload Successful!
                  </h3>
                  <p className="text-gray-600 text-sm">{successMessage}</p>
                  <button
                    onClick={removeFile}
                    className="mt-2 px-4 py-2 bg-[#035670] text-white rounded-lg hover:bg-[#3098a1] text-sm font-medium cursor-pointer"
                  >
                    Upload Another
                  </button>
                </div>
              ) : uploadStatus === "error" ? (
                <div className="space-y-4">
                  <AlertCircle className="text-red-500 mx-auto" size={48} />
                  <h3 className="text-lg font-semibold text-red-700">
                    Upload Failed
                  </h3>
                  <p className="text-red-600 text-sm break-words px-2">
                    {errorMessage}
                  </p>
                  <button
                    onClick={removeFile}
                    className="mt-2 px-4 py-2 bg-[#035670] text-white rounded-lg hover:bg-[#3098a1] text-sm font-medium cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              ) : uploadStatus === "uploading" ? (
                <div className="space-y-2 trackting-tighter">
                  <Loader2
                    className="text-[#035670] animate-spin mx-auto"
                    size={48}
                  />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Uploading...
                  </h3>
                  <p className="text-gray-600 text-sm">Processing your file</p>
                </div>
              ) : uploadedFile ? (
                <div className="space-y-2 tracking-tighter">
                  <CheckCircle className="text-green-500 mx-auto" size={32} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    File Ready
                  </h3>
                  <div className="flex flex-col items-center gap-1 text-gray-600">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={18} />
                      <span className="text-sm break-all max-w-xs">
                        {uploadedFile.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <div className="flex gap-3 justify-center mt-4">
                    <button
                      onClick={removeFile}
                      className="px-4 py-2 text-[#035670] border border-[#035670] rounded-sm bg-white hover:bg-gray-100 text-sm font-medium cursor-pointer duration-200 ease-in-out z-50"
                    >
                      Remove
                    </button>
                    <button
                      onClick={uploadFile}
                      className="px-4 py-2 bg-[#035670] text-white rounded-sm hover:bg-[#3098a1] text-sm font-medium cursor-pointer duration-200 ease-in-out z-50"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 cursor-pointer flex flex-col items-center tracking-tighter">
                  <Upload
                    className={`${
                      dragActive ? "text-blue-500" : "text-gray-400"
                    }`}
                    size={32}
                    aria-hidden="true"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {dragActive ? "Drop your file here" : "Upload Doctors Data"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Drag & drop your Excel file, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported: {validExtensions.join(", ")} • Max:{" "}
                    {fileSizeLimit / 1024 / 1024}MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SchemaHelpModal
        isOpen={showSchemaHelp}
        onClose={() => setShowSchemaHelp(false)}
        schemaInfo={schemaInfo}
      />
    </div>
  );
};

export default UploadSheetModal;
