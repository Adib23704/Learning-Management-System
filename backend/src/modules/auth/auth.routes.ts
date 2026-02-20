import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { authController } from "./auth.controller.js";
import {
  changePasswordDto,
  loginDto,
  registerDto,
  updateProfileDto,
} from "./auth.dto.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many attempts, try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/register",
  authLimiter,
  validate({ body: registerDto }),
  authController.register,
);

router.post(
  "/login",
  authLimiter,
  validate({ body: loginDto }),
  authController.login,
);

router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.get("/me", authenticate, authController.getMe);
router.patch(
  "/me",
  authenticate,
  validate({ body: updateProfileDto }),
  authController.updateProfile,
);
router.patch(
  "/me/password",
  authenticate,
  validate({ body: changePasswordDto }),
  authController.changePassword,
);

export default router;
