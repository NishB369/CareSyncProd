import express from "express"
import { authenticateUser, requiresRole } from "../middlewares/auth.middleware";
import { deleteAppointment, editAppointment, getAllDoctorAppointments, getAppointmentById, getDoctorAppointment, rescheduleAppointment, scheduleAppointment } from "../controllers/appointment.controller";

const appointmentRouter = express.Router ();

appointmentRouter.post ('/schedule', authenticateUser, requiresRole(["STAFF"]),scheduleAppointment)
appointmentRouter.post ('/reschedule', authenticateUser, requiresRole(["STAFF"]),rescheduleAppointment)
appointmentRouter.get ('/all-appointments', authenticateUser, requiresRole(["STAFF"]),getAllDoctorAppointments)
appointmentRouter.put ('/edit/:id', authenticateUser, requiresRole(["STAFF"]),editAppointment)
appointmentRouter.delete ('/:id', authenticateUser, requiresRole(["STAFF"]),deleteAppointment)
appointmentRouter.get ('/:id', authenticateUser, requiresRole(["STAFF"]),getAppointmentById)
appointmentRouter.delete ('/doctor/:id', authenticateUser, requiresRole(["STAFF"]),getDoctorAppointment)

export default appointmentRouter