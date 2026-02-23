import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { analyticsController } from "./analytics.controller.js";

const router: Router = Router();
router.use(authenticate);

router.get(
  "/overview",
  authorize("ADMIN", "SUPER_ADMIN"),
  analyticsController.getOverview,
);
router.get(
  "/enrollment-growth",
  authorize("ADMIN", "SUPER_ADMIN"),
  analyticsController.getEnrollmentGrowth,
);
router.get(
  "/top-courses",
  authorize("ADMIN", "SUPER_ADMIN"),
  analyticsController.getTopCourses,
);
router.get(
  "/revenue",
  authorize("ADMIN", "SUPER_ADMIN"),
  analyticsController.getRevenueByCourse,
);
router.get(
  "/completion-rates",
  authorize("ADMIN", "SUPER_ADMIN"),
  analyticsController.getCompletionRates,
);

router.get(
  "/instructor/overview",
  authorize("INSTRUCTOR"),
  analyticsController.getInstructorOverview,
);
router.get(
  "/instructor/revenue",
  authorize("INSTRUCTOR"),
  analyticsController.getInstructorRevenue,
);

export default router;
