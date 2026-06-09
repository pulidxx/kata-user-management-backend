import { Response } from "express";
import { ClientService } from "../services/client.service";
import {
  CreateClientDto,
  UpdateClientDto,
  UpdateStatusDto,
  ClientQueryDto,
} from "../dtos/client.dtos";
import { AuthenticatedRequest } from "../../../types";
import { handleError } from "../../../utils";

export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  getAllClients = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const query = req.query as unknown as ClientQueryDto;
      const result = await this.clientService.getAllClients(req.user!, query);
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  getClientById = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const result = await this.clientService.getClientById(req.user!, id);
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  createClient = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const dto: CreateClientDto = req.body;
      const result = await this.clientService.createClient(req.user!, dto);
      res.status(201).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  updateClient = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const dto: UpdateClientDto = req.body;
      const result = await this.clientService.updateClient(req.user!, id, dto);
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  updateClientStatus = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const dto: UpdateStatusDto = req.body;
      const result = await this.clientService.updateClientStatus(
        req.user!,
        id,
        dto
      );
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    }
  };

  deleteClient = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.clientService.deleteClient(req.user!, id);
      res.status(200).json({ message: "Cliente eliminado", id });
    } catch (error) {
      handleError(error, res);
    }
  };

  exportClients = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const query = req.query as unknown as Omit<
        ClientQueryDto,
        "page" | "limit"
      >;
      const csv = await this.clientService.exportClients(req.user!, query);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=clientes.csv");
      res.status(200).send(csv);
    } catch (error) {
      handleError(error, res);
    }
  };
}
