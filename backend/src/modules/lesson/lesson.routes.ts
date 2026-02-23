import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { lessonController } from "./lesson.controller.js";
import {
  createLessonDto,
  reorderLessonsDto,
  updateLessonDto,
} from "./lesson.dto.js";

const router: Router = Router({ mergeParams: true });

router.get("/", lessonController.listByCourse);
router.get("/:lessonId", authenticate, lessonController.getById);

router.post(
  "/",
  authenticate,
  authorize("INSTRUCTOR"),
  validate({ body: createLessonDto }),
  lessonController.create,
);

router.patch(
  "/:lessonId",
  authenticate,
  authorize("INSTRUCTOR"),
  validate({ body: updateLessonDto }),
  lessonController.update,
);

router.delete(
  "/:lessonId",
  authenticate,
  authorize("INSTRUCTOR"),
  lessonController.delete,
);

router.patch(
  "/reorder",
  authenticate,
  authorize("INSTRUCTOR"),
  validate({ body: reorderLessonsDto }),
  lessonController.reorder,
);

export default router;
