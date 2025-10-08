import express from "express"
import { authenticateUser, requiresRole } from "../middlewares/auth.middleware";
import { getAllDoctorsQueue } from "../controllers/queue.controller";

const queueRoter = express.Router ();

queueRoter.get ('/all', authenticateUser, requiresRole(["STAFF"]) ,getAllDoctorsQueue)


export default queueRoter