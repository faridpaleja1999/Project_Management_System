import express, { Router } from "express";
import { UserType } from "../configs/constant";
import {
  createProject,
  deleteProject,
  getAllProject,
  getProjectById,
  updateProject,
} from "../controllers/projectController";
import { checkUserAccess } from "../middleware/authorization";

const router: Router = express.Router();

router.get(
  "/",
  checkUserAccess(UserType.ADMIN, UserType.MANAGER, UserType.DEVELOPER),
  getAllProject
);
router.get(
  "/:projectId",
  checkUserAccess(UserType.ADMIN, UserType.MANAGER, UserType.DEVELOPER),
  getProjectById
);
router.post(
  "/",
  checkUserAccess(UserType.ADMIN, UserType.MANAGER),
  createProject
);
router.patch(
  "/:projectId",
  checkUserAccess(UserType.ADMIN, UserType.MANAGER),
  updateProject
);
router.delete(
  "/:projectId",
  checkUserAccess(UserType.ADMIN, UserType.MANAGER),
  deleteProject
);

export default router;
