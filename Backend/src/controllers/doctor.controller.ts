import { Request, Response } from "express";
import { prisma } from "../db/index";
import { hashPassword } from "../utils/auth.utils";
import { v2 as cloudinary } from "cloudinary";
import { GenderType, UserRole } from "@prisma/client";

// Helper to validate and cast gender
const parseGender = (gender: string): GenderType | null => {
  const upper = gender?.toUpperCase();
  if (upper === "MALE" || upper === "FEMALE" || upper === "OTHER") {
    return upper as GenderType;
  }
  return null;
};

const addDoctor = async (req: Request, res: Response) => {
  try {
    const { name, phoneNumber, gender, specialization, email, password } =
      req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Doctor image is required.",
      });
    }

    if (
      !name ||
      !email ||
      !password ||
      !phoneNumber ||
      !gender ||
      !specialization
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    const genderEnum = parseGender(gender);
    if (!genderEnum) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender. Must be 'MALE', 'FEMALE', or 'OTHER'",
      });
    }

    let parsedSchedule = {};
    if (req.body.schedule) {
      try {
        parsedSchedule = JSON.parse(req.body.schedule);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Schedule must be a valid JSON object",
        });
      }
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
    });

    // Create doctor first
    const doctor = await prisma.doctor.create({
      data: {
        name,
        image: result.secure_url,
        phoneNumber,
        gender: genderEnum,
        specialization,
        schedule: parsedSchedule,
        isAvailable: true, // default per schema
      },
    });

    // Then create user linked to doctor
    const user = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        role: UserRole.DOCTOR,
        doctorId: doctor.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      data: { doctor, user },
    });
  } catch (error: any) {
    console.error("Error adding doctor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const editDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, gender, specialization, schedule, isAvailable } =
      req.body;

    const existingDoctor = await prisma.doctor.findUnique({ where: { id } });
    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    let imageUrl = existingDoctor.image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      imageUrl = result.secure_url;
    }

    let genderEnum: GenderType | undefined;
    if (gender !== undefined) {
      const parsed = parseGender(gender);
      if (!parsed) {
        return res.status(400).json({
          success: false,
          message: "Invalid gender. Must be 'MALE', 'FEMALE', or 'OTHER'",
        });
      }
      genderEnum = parsed;
    }

    let updatedSchedule = existingDoctor.schedule;
    if (schedule !== undefined) {
      try {
        updatedSchedule =
          typeof schedule === "string" ? JSON.parse(schedule) : schedule;
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid schedule format",
        });
      }
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        name,
        image: imageUrl,
        phoneNumber,
        gender: genderEnum,
        specialization,
        schedule: updatedSchedule === null ? undefined : updatedSchedule,
        isAvailable:
          isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: updatedDoctor,
    });
  } catch (error: any) {
    console.error("Error updating doctor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Delete user first (due to foreign key constraint)
    if (existingDoctor.user) {
      await prisma.user.delete({ where: { id: existingDoctor.user.id } });
    }

    await prisma.doctor.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting doctor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor fetched successfully",
      data: doctor,
    });
  } catch (error: any) {
    console.error("Error fetching doctor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const changeAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingDoctor = await prisma.doctor.findUnique({ where: { id } });
    if (!existingDoctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor doesn't exist" });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: { isAvailable: !existingDoctor.isAvailable },
    });

    return res.status(200).json({
      success: true,
      message: `Doctor availability changed to ${updatedDoctor.isAvailable}`,
      data: updatedDoctor,
    });
  } catch (error: any) {
    console.error("Error changing availability:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getDoctorAvailableSlotsByDate = async (req: Request, res: Response) => {
  // Keep this as-is — it's mostly correct and doesn't use invalid fields
  // (Assuming `schedule` is stored as JSON and parsed properly)
  // ... (your existing implementation is fine here)
  // But note: `slot` in Appointment is Json, so comparison logic must handle that.
  // We'll keep your logic but add a note below.
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    if (!doctor.isAvailable) {
      return res.status(200).json({
        success: true,
        message: "Doctor is not available",
        data: [],
      });
    }

    const givenDate = new Date(date as string);
    if (isNaN(givenDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use ISO string (e.g., '2024-06-15').",
      });
    }

    const dayName = givenDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();

    // Parse schedule safely
    let schedule: Record<string, string[]> = {};
    if (typeof doctor.schedule === "string") {
      try {
        schedule = JSON.parse(doctor.schedule);
      } catch (e) {
        console.warn("Failed to parse schedule JSON");
      }
    } else if (
      typeof doctor.schedule === "object" &&
      doctor.schedule !== null
    ) {
      schedule = doctor.schedule as Record<string, string[]>;
    }

    const daySlots = schedule[dayName] || [];
    if (daySlots.length === 0) {
      return res.status(200).json({
        success: true,
        message: `Doctor has no schedule for ${dayName}`,
        data: [],
      });
    }

    const now = new Date();
    let filteredSlots = [...daySlots];
    if (givenDate.toDateString() === now.toDateString()) {
      const parseEndTime = (slot: string): Date | null => {
        const parts = slot.split("-").map((p) => p.trim());
        if (parts.length !== 2) return null;
        const endTimeStr = parts[1];
        const match = endTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!match) return null;
        let [, h, m, period] = match;
        let hours = parseInt(h, 10);
        const minutes = parseInt(m, 10);
        if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
        if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
        const d = new Date(givenDate);
        d.setHours(hours, minutes, 0, 0);
        return d;
      };

      filteredSlots = filteredSlots.filter((slot) => {
        const endTime = parseEndTime(slot);
        return endTime && endTime > now;
      });
    }

    const startOfDay = new Date(givenDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(givenDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        appointmentDate: { gte: startOfDay, lte: endOfDay },
      },
      select: { slot: true },
    });

    const bookedSlots = bookedAppointments.flatMap((appt) => {
      if (typeof appt.slot === "string") return [appt.slot];
      if (Array.isArray(appt.slot)) return appt.slot.map(String);
      return [String(appt.slot)];
    });

    const normalize = (s: string) => s.replace(/\s+/g, "").toUpperCase();
    const availableSlots = filteredSlots.filter(
      (slot) => !bookedSlots.some((b) => normalize(b) === normalize(slot))
    );

    return res.status(200).json({
      success: true,
      message: `Available slots for ${dayName} (${date})`,
      data: availableSlots,
    });
  } catch (error: any) {
    console.error("Error fetching available slots:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: doctors.length
        ? "Doctors fetched successfully"
        : "No doctors available",
      data: doctors,
    });
  } catch (error: any) {
    console.error("Error fetching doctors:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAvailableDoctorsByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Date query parameter is required" });
    }

    const targetDate = new Date(date as string);
    if (isNaN(targetDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    }

    const days = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const dayOfWeek = days[targetDate.getDay()];

    const doctors = await prisma.doctor.findMany({
      where: { isAvailable: true },
    });

    const availableDoctors = doctors.filter((doc) => {
      let schedule = doc.schedule;
      if (typeof schedule === "string") {
        try {
          schedule = JSON.parse(schedule);
        } catch {
          return false;
        }
      }
      return (
        typeof schedule === "object" &&
        schedule !== null &&
        Array.isArray((schedule as Record<string, any>)[dayOfWeek]) &&
        (schedule as Record<string, any>)[dayOfWeek].length > 0
      );
    });

    return res.status(200).json({
      success: true,
      message: `Available doctors for ${dayOfWeek} (${targetDate.toDateString()})`,
      data: availableDoctors,
    });
  } catch (error: any) {
    console.error("Error fetching available doctors:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  addDoctor,
  editDoctor,
  deleteDoctor,
  changeAvailability,
  getAvailableDoctorsByDate,
  getDoctorAvailableSlotsByDate,
  getAllDoctors,
  getDoctorById,
};
