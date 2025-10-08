import express from "express";
import { authenticateUser, requiresRole } from "../middlewares/auth.middleware";
import { dashboardStats } from "../controllers/home.controller";

const homeRouter = express.Router();

homeRouter.get("/", authenticateUser, requiresRole(["STAFF"]), dashboardStats);

export default homeRouter;
