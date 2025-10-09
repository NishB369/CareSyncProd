import { AlertTriangle } from "lucide-react";
import React from "react";

const AlertPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-gray-50 rounded-2xl p-8 shadow-xl border border-gray-200">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-amber-600" size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Optimal Viewing Experience
        </h1>
        <p className="text-gray-600 mb-6">
          For the best experience, please view this application on a laptop or
          desktop device.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 text-left">
          <h2 className="font-semibold text-blue-800 mb-2">Why?</h2>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Complex dashboard layout requires larger screen</li>
            <li>• Interactive features work best with mouse input</li>
            <li>• Data visualization needs adequate screen space</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlertPage;
