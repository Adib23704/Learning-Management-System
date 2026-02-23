import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { enrollmentController } from "./enrollment.controller.js";
import { enrollmentQueryDto } from "./enrollment.dto.js";

const router: Router = Router();

router.get(
  "/me",
  authenticate,
  authorize("STUDENT"),
  validate({ query: enrollmentQueryDto }),
  enrollmentController.getMyEnrollments,
);

router.get(
  "/me/courses/:courseId",
  authenticate,
  authorize("STUDENT"),
  enrollmentController.getEnrollmentDetail,
);

router.post(
  "/courses/:courseId",
  authenticate,
  authorize("STUDENT"),
  enrollmentController.enroll,
);

router.patch(
  "/courses/:courseId/drop",
  authenticate,
  authorize("STUDENT"),
  enrollmentController.drop,
);

router.post(
  "/courses/:courseId/lessons/:lessonId/complete",
  authenticate,
  authorize("STUDENT"),
  enrollmentController.markLessonComplete,
);

router.get(
  "/courses/:courseId/progress",
  authenticate,
  authorize("STUDENT"),
  enrollmentController.getProgress,
);

export default router;
