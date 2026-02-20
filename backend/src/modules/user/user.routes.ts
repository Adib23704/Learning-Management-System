import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { userController } from "./user.controller.js";
import { createUserDto, updateUserDto, userQueryDto } from "./user.dto.js";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN", "ADMIN"));

router.get("/", validate({ query: userQueryDto }), userController.list);
router.get("/:id", userController.getById);
router.post("/", validate({ body: createUserDto }), userController.create);
router.patch("/:id", validate({ body: updateUserDto }), userController.update);
router.patch("/:id/suspend", userController.suspend);
router.patch("/:id/activate", userController.activate);

export default router;
