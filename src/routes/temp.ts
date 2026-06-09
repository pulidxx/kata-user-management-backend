import { Router } from "express";
import { UserController } from "../modules/users/controllers/user.controller";

const router = Router();
const userController = new UserController();

router.post("/create-admin", userController.setupAdmin);

export default router;
