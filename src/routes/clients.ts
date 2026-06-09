import { Router } from "express";
import { ClientController } from "../modules/clients/controllers/client.controller";
import {
  authMiddleware,
  requireAdminOrAsesor,
  validateBody,
  validateQuery,
} from "../middleware";
import {
  createClientSchema,
  updateClientSchema,
  updateStatusSchema,
  clientQuerySchema,
} from "../modules/clients/dtos/client.dtos";

const router = Router();
const clientController = new ClientController();

router.use(authMiddleware);

router.get(
  "/",
  validateQuery(clientQuerySchema),
  clientController.getAllClients
);

router.get("/export", requireAdminOrAsesor, clientController.exportClients);

router.get("/:id", clientController.getClientById);

router.post(
  "/",
  requireAdminOrAsesor,
  validateBody(createClientSchema),
  clientController.createClient
);

router.put(
  "/:id",
  validateBody(updateClientSchema),
  clientController.updateClient
);

router.patch(
  "/:id/status",
  validateBody(updateStatusSchema),
  clientController.updateClientStatus
);

router.delete("/:id", clientController.deleteClient);

export default router;
