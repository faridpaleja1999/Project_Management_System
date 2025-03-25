import express, { Router } from "express";
import { UserType } from "../configs/constant";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateStatusTask,
  updateTask,
} from "../controllers/taskController";
import { checkUserAccess } from "../middleware/authorization";

const router: Router = express.Router();

router.get(
  "/",
  checkUserAccess(UserType.ADMIN, UserType.MANAGER, UserType.DEVELOPER),
  getAllTasks
);
router.get(
  "/:taskId",
  checkUserAccess(UserType.ADMIN, UserType.MANAGER, UserType.DEVELOPER),
  getTaskById
);
router.post("/", checkUserAccess(UserType.ADMIN, UserType.MANAGER), createTask);
router.put(
  "/:taskId",
  checkUserAccess(UserType.ADMIN, UserType.MANAGER),
  updateTask
);
router.patch(
  "/:taskId",
  checkUserAccess(UserType.ADMIN, UserType.MANAGER, UserType.DEVELOPER),
  updateStatusTask
);
router.delete(
  "/:taskId",
  checkUserAccess(UserType.ADMIN, UserType.MANAGER),
  deleteTask
);

export default router;
