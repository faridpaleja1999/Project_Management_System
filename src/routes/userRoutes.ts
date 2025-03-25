import express, { Router } from "express";
import { login, register } from "../controllers/userAuthController";
import { validateBody } from "../middleware/validationError";
import { loginValidation, registerValidation } from "../validations/user";

const router: Router = express.Router();

router.post("/register", validateBody(registerValidation), register);
router.post("/login", validateBody(loginValidation), login);

export default router;
