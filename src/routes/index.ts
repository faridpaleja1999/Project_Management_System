import express, { Router } from "express";
import projectRoute from "./projectRoutes";
import userRoute from "./userRoutes";
import taskRoute from "./taskRoutes";
import { checkAuth, checkUserAccess } from "../middleware/authorization";
import { getAllAuditLogs } from "../controllers/auditController";
import { UserType } from "../configs/constant";

const router: Router = express.Router();

router.use("/auth", userRoute);
router.use("/projects", checkAuth, projectRoute);
router.use("/tasks", checkAuth, taskRoute);
router.use(
  "/audit",
  checkAuth,
  checkUserAccess(UserType.ADMIN),
  getAllAuditLogs
);

export default router;
