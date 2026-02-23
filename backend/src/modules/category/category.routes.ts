import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { categoryController } from "./category.controller.js";
import { createCategoryDto, updateCategoryDto } from "./category.dto.js";

const router: Router = Router();

router.get("/", categoryController.list);
router.get("/:id", categoryController.getById);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate({ body: createCategoryDto }),
  categoryController.create,
);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate({ body: updateCategoryDto }),
  categoryController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  categoryController.delete,
);

export default router;
