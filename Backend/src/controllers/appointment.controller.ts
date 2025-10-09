import { Request, Response } from "express";
import { prisma } from "../db/index";
// import { sendAppointmentEmail } from "./email.controller";
import { AppointmentStatus, GenderType, QueueType } from "@prisma/client";

const timeToMinutes = (time: string): number | null => {
  const clean = time.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2})(?::(\d{2}))?(AM|PM)$/);
  if (!match) {
    console.error("Invalid time format:", time);
    return null;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] || "0", 10);
  const meridiem = match[3];

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const isOverlap = (range1: string, range2: string): boolean => {
  const clean1 = range1.replace(/\s/g, "").toUpperCase();
  const clean2 = range2.replace(/\s/g, "").toUpperCase();

  const parts1 = clean1.split("-");
  const parts2 = clean2.split("-");

  if (parts1.length !== 2 || parts2.length !== 2) return false;

  const start1 = timeToMinutes(parts1[0]);
  const end1 = timeToMinutes(parts1[1]);
  const start2 = timeToMinutes(parts2[0]);
  const end2 = timeToMinutes(parts2[1]);

  if (start1 === null || end1 === null || start2 === null || end2 === null) {
    return false;
  }

  return start1 < end2 && start2 < end1;
};

function getUTCRange(dateStr: string) {
  const d = new Date(dateStr);

  const startOfDay = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0)
  );
  const endOfDay = new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  return { startOfDay, endOfDay };
}

const scheduleAppointment = async (req: Request, res: Response) => {
  try {
    const {
      doctorId,
      slot,
      appointmentDate,
      visitType,
      queueType, // ✅ FIXED: Added queueType
      patientName,
      patientEmail,
      patientPhoneNumber,
      patientIssue,
      patientAddress,
      patientAge,
      patientGender,
    } = req.body;

    if (
      !doctorId ||
      !slot ||
      !appointmentDate ||
      !patientName ||
      !patientEmail ||
      !patientPhoneNumber ||
      !patientIssue ||
      !patientAddress ||
      !patientAge ||
      !patientGender
    ) {
      return res.status(400).json({
        message: "Please provide all details to schedule appointment",
      });
    }

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: true,
      },
    });

    if (!existingDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (!existingDoctor.isAvailable) {
      return res
        .status(200)
        .json({ message: "Doctor is currently not available" });
    }

    const apptDate = new Date(appointmentDate);
    if (isNaN(apptDate.getTime())) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    const dayKey = apptDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();

    // Normalize doctor schedule keys to uppercase to avoid casing issues
    const rawSchedule = existingDoctor.schedule as Record<string, unknown>;
    const normalizedSchedule: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(rawSchedule)) {
      if (Array.isArray(value)) {
        normalizedSchedule[key.toUpperCase()] = value.map(String);
      }
    }

    const daySchedule = normalizedSchedule[dayKey] || [];

    const isSlotValid = daySchedule.some((range) => isOverlap(range, slot));
    if (!isSlotValid) {
      console.log(
        "Debug - Doctor schedule keys:",
        Object.keys(normalizedSchedule)
      );
      console.log("Debug - Requested day:", dayKey);
      console.log("Debug - Available slots:", daySchedule);
      console.log("Debug - Requested slot:", slot);
      return res.status(400).json({
        message: "Doctor is not available at the selected slot",
      });
    }

    const startOfDay = new Date(apptDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(apptDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const isDoubleBooked = existingAppointments.some((appt) =>
      isOverlap(appt.slot as string, slot)
    );
    if (isDoubleBooked) {
      return res
        .status(400)
        .json({ message: "Selected slot is already booked" });
    }

    let patient = await prisma.patient.findUnique({
      where: { phoneNumber: patientPhoneNumber },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          name: patientName,
          email: patientEmail,
          phoneNumber: patientPhoneNumber,
          issue: patientIssue,
          address: patientAddress,
          age: Number(patientAge),
          gender: patientGender.toUpperCase() as GenderType,
        },
      });
    }

    let queueNumber = 1;
    if (existingAppointments.length > 0) {
      queueNumber =
        existingAppointments.reduce(
          (max, appt) => Math.max(max, appt.queueNumber),
          0
        ) + 1;
    }

    const createAppointment = await prisma.appointment.create({
      data: {
        doctorId,
        appointmentDate: new Date(appointmentDate),
        patientId: patient.id,
        queueType: (queueType?.toUpperCase() as QueueType) || "APPOINTMENT", // ✅ FIXED: Now uses the variable with default
        slot,
        queueNumber,
        appointmentCode: `APPT-${Date.now()}`,
      },
    });

    // try {
    //   await sendAppointmentEmail(
    //     {
    //       body: {
    //         to: [patientEmail, existingDoctor.user?.email],
    //         doctorName: existingDoctor.name,
    //         appointmentTime: `${slot} on ${new Date(
    //           appointmentDate
    //         ).toLocaleDateString()}`,
    //         doctorImage: existingDoctor.image,
    //         appointmentId: createAppointment.id,
    //       },
    //     } as unknown as Request,
    //     {} as Response
    //   );
    // } catch (emailError) {
    //   console.error("Failed to send appointment email:", emailError);
    // }

    return res.status(201).json({
      message: "Appointment scheduled",
      appointment: createAppointment,
    });
  } catch (error) {
    console.error("Error in scheduleAppointment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllDoctorAppointments = async (req: Request, res: Response) => {
  try {
    console.log("✅ getAllAppointment v2 is running!");

    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const d = new Date(date as string);

    const { startOfDay, endOfDay } = getUTCRange(date as string);

    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            image: true,
            isAvailable: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            age: true,
            gender: true,
            issue: true,
          },
        },
      },
      orderBy: [{ doctorId: "asc" }, { queueNumber: "asc" }],
    });

    if (!appointments.length) {
      return res.status(200).json({
        success: true,
        message: "No appointments found for this date",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const editAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      slot,
      appointmentDate,
      queueType, // ✅ FIXED: Added queueType
      status,
      patientName,
      patientEmail,
      patientPhoneNumber,
      patientIssue,
      patientAddress,
      patientAge,
      patientGender,
    } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, patient: true },
    });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    const doctor = appointment.doctor;
    if (!doctor.isAvailable)
      return res.status(400).json({ message: "Doctor not available" });

    const newDate = appointmentDate
      ? new Date(appointmentDate)
      : appointment.appointmentDate;
    const day = newDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();
    const schedule = doctor.schedule as Record<string, string[]>;
    const daySlots = schedule[day] || [];

    const checkSlot = slot ?? (appointment.slot as string);
    const validSlot = daySlots.some((range) => isOverlap(range, checkSlot));
    if (!validSlot)
      return res
        .status(400)
        .json({ message: "Doctor not available in this slot" });

    const sameDayAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        appointmentDate: {
          gte: new Date(newDate.setHours(0, 0, 0, 0)),
          lte: new Date(newDate.setHours(23, 59, 59, 999)),
        },
        NOT: { id },
      },
    });

    const alreadyBooked = sameDayAppointments.some((a) =>
      isOverlap(a.slot as string, checkSlot)
    );
    if (alreadyBooked)
      return res.status(400).json({ message: "Slot already booked" });

    if (patientPhoneNumber) {
      let patient = await prisma.patient.findUnique({
        where: { phoneNumber: patientPhoneNumber },
      });
      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            name: patientName,
            email: patientEmail,
            phoneNumber: patientPhoneNumber,
            issue: patientIssue ?? "",
            address: patientAddress ?? "",
            age: patientAge ?? 0,
            gender: patientGender ?? "OTHER",
          },
        });
      } else {
        await prisma.patient.update({
          where: { id: patient.id },
          data: {
            name: patientName ?? patient.name,
            issue: patientIssue ?? patient.issue,
            address: patientAddress ?? patient.address,
            age: patientAge ?? patient.age,
            gender: patientGender ?? patient.gender,
          },
        });
      }

      await prisma.appointment.update({
        where: { id },
        data: { patientId: patient.id },
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        slot: slot ?? appointment.slot,
        appointmentDate: newDate,
        queueType: queueType
          ? (queueType.toUpperCase() as QueueType)
          : appointment.queueType, // ✅ FIXED: Now properly defined
        status: status ?? appointment.status,
      },
    });

    return res
      .status(200)
      .json({ message: "Appointment updated", appointment: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const rescheduleAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { appointmentDate, slot } = req.body;

    if (!appointmentDate || !slot)
      return res
        .status(400)
        .json({ message: "appointmentDate and slot are required" });

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true },
    });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    const doctor = appointment.doctor;
    if (!doctor.isAvailable)
      return res.status(400).json({ message: "Doctor not available" });

    const date = new Date(appointmentDate);
    const day = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();
    const schedule = doctor.schedule as Record<string, string[]>;
    const daySlots = schedule[day] || [];

    const validSlot = daySlots.some((range) => isOverlap(range, slot));
    if (!validSlot)
      return res
        .status(400)
        .json({ message: "Doctor not available in this slot" });

    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sameDayAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        NOT: { id },
      },
    });

    const alreadyBooked = sameDayAppointments.some((a) =>
      isOverlap(a.slot as string, slot)
    );
    if (alreadyBooked)
      return res.status(400).json({ message: "Slot already booked" });

    const queueNumber =
      sameDayAppointments.length > 0
        ? sameDayAppointments.reduce(
            (max, a) => Math.max(max, a.queueNumber),
            0
          ) + 1
        : 1;

    const updated = await prisma.appointment.update({
      where: { id },
      data: { appointmentDate: new Date(appointmentDate), slot, queueNumber },
    });

    return res
      .status(200)
      .json({ message: "Appointment rescheduled", appointment: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    await prisma.appointment.delete({ where: { id } });
    return res.status(200).json({ message: "Appointment deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const getDoctorAppointment = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.doctorId;
    if (!doctorId)
      return res.status(400).json({ message: "doctorId is required" });

    const { date } = req.body;
    const where: any = { doctorId };

    if (date) {
      const d = new Date(date);
      where.appointmentDate = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: true },
      orderBy: { queueNumber: "asc" },
    });

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, patient: true },
    });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    return res.status(200).json({ appointment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const changeAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: AppointmentStatus[] = [
      "PENDING",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or missing appointment status. Must be one of: PENDING, COMPLETED, CANCELLED",
      });
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        doctor: { select: { name: true } },
        patient: { select: { name: true } },
        appointmentDate: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  scheduleAppointment,
  editAppointment,
  deleteAppointment,
  rescheduleAppointment,
  getAllDoctorAppointments,
  getAppointmentById,
  getDoctorAppointment,
  changeAppointmentStatus,
};
