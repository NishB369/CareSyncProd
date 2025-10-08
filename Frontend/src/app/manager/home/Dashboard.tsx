"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  Stethoscope,
  TrendingUp,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import axios from "axios";

const APPOINTMENT_COLOR_MAP: Record<string, string> = {
  Booked: "#0A7F9F",
  Canceled: "#EF4444",
  Rescheduled: "#066885",
};

const QUEUE_COLOR_MAP: Record<string, string> = {
  Waiting: "#066885",
  "With Doctor": "#035670",
  Completed: "#0A7F9F",
};

const mapAppointmentData = (data: { name: string; value: number }[]) =>
  data.map((item) => ({
    ...item,
    color: APPOINTMENT_COLOR_MAP[item.name] || "#ccc",
  }));

const mapQueueData = (data: { name: string; value: number }[]) =>
  data.map((item) => ({
    ...item,
    color: QUEUE_COLOR_MAP[item.name] || "#ccc",
  }));

interface Stat {
  totalAppointments: number;
  currentQueue: number;
  availableDoctors: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface SnapshotData {
  totalAppointments: number;
  walkIns: number;
  avgWaitTime: string;
  availableDoctors: number;
  urgentCases: number;
  patientsServed: number;
}

interface ApiResponse {
  stats: Stat;
  appointmentStatusData: Omit<ChartDataItem, "color">[];
  queueStatusData: Omit<ChartDataItem, "color">[];
  snapshotData: SnapshotData;
}

const ShimmerCard = () => (
  <div className="bg-white/80 shadow-sm rounded-lg border border-slate-700/50 p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="p-3 bg-gray-200 rounded-sm w-12 h-12"></div>
    </div>
  </div>
);

const ShimmerChart = () => (
  <div className="bg-white/80 shadow-sm rounded-lg border border-slate-700/50 p-5 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div
    className="bg-white/80 shadow-sm rounded-lg border border-slate-700/50 p-5 hover:shadow-md duration-200
  ease-in-out group"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="p-3 bg-[#035670] rounded-sm text-white group-hover:scale-105 duration-200 ease-in-out">
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/home/`,
          { withCredentials: true }
        );

        setData(res.data);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 sm:p-2 font-light tracking-tighter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="tracking-tighter text-4xl font-light">
              Clinic <span className="font-medium">Dashboard</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ShimmerChart />
            <ShimmerChart />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-6 sm:p-2 font-light tracking-tighter flex items-center justify-center">
        <div className="bg-white/80 shadow-sm rounded-sm border border-red-200 p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-red-700 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#035670] text-white rounded hover:bg-[#024a60] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const appointmentData = mapAppointmentData(data.appointmentStatusData);
  const queueData = mapQueueData(data.queueStatusData);

  return (
    <div className="min-h-screen px-4 py-6 sm:p-2 font-light tracking-tighter">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="tracking-tighter text-4xl font-light">
            Clinic <span className="font-medium">Dashboard</span>
          </h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard
            title="Appointments Today"
            value={data.stats.totalAppointments}
            icon={<Calendar className="w-6 h-6" />}
          />
          <StatCard
            title="Available Doctors"
            value={data.stats.availableDoctors}
            icon={<Stethoscope className="w-6 h-6" />}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Patients Served"
            value={data.snapshotData.patientsServed}
          />
          <StatCard
            title="In Queue"
            value={data.stats.currentQueue}
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            icon={<UserCheck className="w-6 h-6" />}
            title="Walk-ins Added"
            value={data.snapshotData.walkIns}
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Urgent Cases"
            value={data.snapshotData.urgentCases}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 shadow-sm rounded-lg border border-slate-700/50 p-5">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Appointment Status
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentData}
                    cx="50%"
                    cy="50%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {appointmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/80 shadow-lg rounded-sm border border-slate-700/50 p-5">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Queue Status
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={queueData}
                    cx="50%"
                    cy="50%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {queueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
