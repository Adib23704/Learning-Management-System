import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { upload } from "../../middleware/upload.js";
import { validate } from "../../middleware/validate.js";
import { courseController } from "./course.controller.js";
import {
  courseQueryDto,
  courseStatusDto,
  createCourseDto,
  updateCourseDto,
} from "./course.dto.js";

const router = Router();

router.get("/", validate({ query: courseQueryDto }), courseController.list);
router.get("/slug/:slug", courseController.getBySlug);
router.get("/:id", courseController.getById);

router.post(
  "/",
  authenticate,
  authorize("INSTRUCTOR"),
  validate({ body: createCourseDto }),
  courseController.create,
);

router.patch(
  "/:id",
  authenticate,
  authorize("INSTRUCTOR", "ADMIN", "SUPER_ADMIN"),
  validate({ body: updateCourseDto }),
  courseController.update,
);

router.delete(
  "/:id",
  authenticate,
  authorize("INSTRUCTOR", "ADMIN", "SUPER_ADMIN"),
  courseController.delete,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("INSTRUCTOR", "ADMIN", "SUPER_ADMIN"),
  validate({ body: courseStatusDto }),
  courseController.updateStatus,
);

router.post(
  "/:id/thumbnail",
  authenticate,
  authorize("INSTRUCTOR", "ADMIN", "SUPER_ADMIN"),
  upload.single("thumbnail"),
  courseController.uploadThumbnail,
);

router.get(
  "/:id/students",
  authenticate,
  authorize("INSTRUCTOR", "ADMIN", "SUPER_ADMIN"),
  courseController.getEnrolledStudents,
);

export default router;
