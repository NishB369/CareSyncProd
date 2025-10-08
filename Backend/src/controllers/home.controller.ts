import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { start, end };
};

const dashboardStats = async (req: Request, res: Response) => {
  try {
    const { start: startOfDay, end: endOfDay } = getTodayRange();

    const totalAppointments = await prisma.appointment.count({
      where: {
        appointmentDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const currentQueue = await prisma.appointment.count({
      where: {
        status: "PENDING",
        appointmentDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const availableDoctors = await prisma.doctor.count({
      where: {
        isAvailable: true,
      },
    });

    const statusCounts = await prisma.appointment.groupBy({
      by: ["status"],
      where: {
        appointmentDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      _count: {
        status: true,
      },
    });

    let pendingCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    statusCounts.forEach((item) => {
      if (item.status === "PENDING") pendingCount = item._count.status;
      if (item.status === "COMPLETED") completedCount = item._count.status;
      if (item.status === "CANCELLED") cancelledCount = item._count.status;
    });

    const appointmentStatusData = [
      { name: "Booked", value: pendingCount, color: "#3b82f6" },
      { name: "Canceled", value: cancelledCount, color: "#ef4444" },
      { name: "Rescheduled", value: 0, color: "#60a5fa" },
    ];

    const queueStatusData = [
      { name: "Waiting", value: pendingCount, color: "#60a5fa" },
      { name: "With Doctor", value: 0, color: "#2563eb" },
      { name: "Completed", value: completedCount, color: "#93c5fd" },
    ];

    const walkIns = await prisma.appointment.count({
      where: {
        queueType: "WALKIN",
        appointmentDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const urgentCases = await prisma.appointment.count({
      where: {
        queueType: "EMERGENCY",
        appointmentDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const patientsServed = completedCount;

    const response = {
      stats: {
        totalAppointments,
        currentQueue,
        availableDoctors,
      },
      appointmentStatusData,
      queueStatusData,
      snapshotData: {
        totalAppointments,
        walkIns,
        availableDoctors,
        urgentCases,
        patientsServed,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};

export { dashboardStats };
