import { Router } from "express";
import { UserController } from "../modules/users/controllers/user.controller";
import { authMiddleware, requireAdmin, validateBody } from "../middleware";
import {
  createUserSchema,
  updateUserSchema,
  changeRoleSchema,
} from "../modules/users/dtos/user.dtos";

const router = Router();
const userController = new UserController();

router.use(authMiddleware, requireAdmin);

router.get("/", userController.getAllUsers);

router.post("/", validateBody(createUserSchema), userController.createUser);

router.put("/:id", validateBody(updateUserSchema), userController.updateUser);

router.patch(
  "/:id/role",
  validateBody(changeRoleSchema),
  userController.changeRole
);

router.delete("/:id", userController.deleteUser);

export default router;
