import express from "express"
import { authenticateUser, requiresRole } from "../middlewares/auth.middleware";
import  { addDoctor, changeAvailability, deleteDoctor, editDoctor, getAllDoctors, getAvailableDoctorsByDate, getDoctorAvailableSlotsByDate, getDoctorById } from "../controllers/doctor.controller";
import upload from "../middlewares/multer.middleware";

const doctorRouter = express.Router ();

doctorRouter.post ('/add', authenticateUser, requiresRole(["STAFF"]), upload.single("image"),addDoctor)
doctorRouter.put ('/edit/:id', authenticateUser, requiresRole(["STAFF"]),upload.single("image"),editDoctor)
doctorRouter.get ('/all-doctors', authenticateUser, requiresRole(["STAFF"]),getAllDoctors)
doctorRouter.delete ('/availability/:id', authenticateUser, requiresRole(["STAFF"]),changeAvailability)
doctorRouter.get ('/available', authenticateUser, requiresRole(["STAFF"]),getAvailableDoctorsByDate)
doctorRouter.get('/:id/slots', authenticateUser, requiresRole(["STAFF"]), getDoctorAvailableSlotsByDate)
doctorRouter.delete ('/:id', authenticateUser, requiresRole(["STAFF"]),deleteDoctor)
doctorRouter.get ('/:id', authenticateUser, requiresRole(["STAFF"]),getDoctorById)

export default doctorRouter