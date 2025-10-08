import React from "react";

const ShimmerGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-400 overflow-hidden tracking-tighter animate-pulse"
        >
          <div className="p-5">
            {/* Profile Image */}
            <div className="flex justify-center mb-4 relative">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 shadow-sm overflow-hidden" />
              <div className="absolute top-0 right-0 flex gap-1">
                <div className="w-6 h-6 rounded-full bg-gray-200" />
                <div className="w-6 h-6 rounded-full bg-gray-200" />
              </div>
            </div>

            {/* Name & Specialization */}
            <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
            <div className="h-4 bg-[#035670]/20 rounded w-1/2 mx-auto"></div>

            {/* Info Rows */}
            <div className="mt-4 space-y-2.5">
              <div className="flex">
                <div className="h-3 bg-gray-200 rounded w-20 flex-shrink-0"></div>
                <div className="h-3 bg-gray-200 rounded flex-1 ml-2"></div>
              </div>
              <div className="flex">
                <div className="h-3 bg-gray-200 rounded w-20 flex-shrink-0"></div>
                <div className="h-3 bg-gray-200 rounded flex-1 ml-2"></div>
              </div>
              <div className="flex">
                <div className="h-3 bg-gray-200 rounded w-20 flex-shrink-0"></div>
                <div className="h-3 bg-gray-200 rounded flex-1 ml-2"></div>
              </div>
            </div>

            {/* Slot Buttons */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
              <div className="flex-1 h-7 bg-gray-200 rounded-md"></div>
              <div className="flex-1 h-7 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShimmerGrid;
