"use client";

import React from "react";
import { X, Download } from "lucide-react";

interface SchemaHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemaInfo: {
    title: string;
    columns: string[];
    sampleRow: string[];
    columnDescriptions: { key: string; description: string }[];
    guidelines: string[];
    commonIssues: string[];
    downloadLink: string;
  };
}

const SchemaHelpModal = ({
  isOpen,
  onClose,
  schemaInfo,
}: SchemaHelpModalProps) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("In production, this would download: " + schemaInfo.downloadLink);
  };

  return (
    <div
      className="fixed inset-0 bg-black/25 flex items-center justify-center z-50 p-4 tracking-tighter"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="schema-help-title"
    >
      <div
        className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-300 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h2
            id="schema-help-title"
            className="text-xl font-semibold text-gray-800"
          >
            {schemaInfo.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 rounded-full p-1 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close help modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Download Sample Button */}

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[#035670] text-white rounded-lg hover:bg-[#3098a1] transition-colors text-sm font-medium cursor-pointer"
          >
            <Download size={16} />
            Download Sample File
          </button>

          {/* Columns & Sample Row as Spreadsheet */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700 border-b border-gray-300">
              Required Columns
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300">
                    {schemaInfo.columns.map((col, i) => (
                      <th
                        key={i}
                        className="px-4 py-2 text-left font-medium text-gray-800"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    {schemaInfo.sampleRow.map((value, i) => (
                      <td key={i} className="px-4 py-2 text-gray-800">
                        {value}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Column Descriptions */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Column Descriptions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {schemaInfo.columnDescriptions.map((desc, i) => (
                <div
                  key={i}
                  className="p-3 border border-gray-200 rounded-lg bg-white"
                >
                  <span className="font-medium text-gray-800">{desc.key}</span>
                  <p className="text-gray-600 text-xs mt-1">
                    {desc.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Upload Guidelines
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              {schemaInfo.guidelines.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>

          {/* Common Issues */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Common Issues</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              {schemaInfo.commonIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaHelpModal;
