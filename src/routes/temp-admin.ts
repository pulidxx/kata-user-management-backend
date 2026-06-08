import { Router, Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";
import { hashPassword } from "../utils/password.utils";

const router = Router();

router.post("/create-admin", async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    const ADMIN_EMAIL = "pulidxx1@gmail.com";
    const userRepository = AppDataSource.getRepository(User);

    const existing = await userRepository.findOne({
      where: { email: ADMIN_EMAIL },
    });

    if (existing) {
      await userRepository.remove(existing);
      console.log(`🗑️  Deleted existing user: ${ADMIN_EMAIL}`);
    }

    const hashedPassword = await hashPassword(password);
    const admin = userRepository.create({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: "Felipe Pulido",
      role: "admin",
    });

    await userRepository.save(admin);

    res.status(201).json({
      message: "Admin user created successfully",
      email: ADMIN_EMAIL,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ error: "Failed to create admin user" });
  }
});

export default router;
