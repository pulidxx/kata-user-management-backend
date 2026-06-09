import { Parser } from "json2csv";
import { Client, User } from "../../../entities";
import {
  ClientRepository,
  ClientQueryOptions,
} from "../repositories/client.repository";
import {
  CreateClientDto,
  UpdateClientDto,
  UpdateStatusDto,
  ClientResponseDto,
  ClientsListResponseDto,
  ClientQueryDto,
} from "../dtos/client.dtos";
import { errors } from "../../../utils";
import { EmailService } from "../../../utils";

export class ClientService {
  private clientRepository: ClientRepository;
  private emailService: EmailService;

  constructor() {
    this.clientRepository = new ClientRepository();
    this.emailService = new EmailService();
  }

  private toClientResponse(client: Client): ClientResponseDto {
    return {
      id: client.id,
      fullName: client.fullName,
      documentType: client.documentType,
      documentNumber: client.documentNumber,
      email: client.email,
      phone: client.phone,
      city: client.city,
      address: client.address,
      birthDate: client.birthDate,
      status: client.status,
      ownerId: client.ownerId,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    };
  }

  private getQueryOptionsForUser(
    user: User,
    query: ClientQueryDto
  ): ClientQueryOptions {
    const options: ClientQueryOptions = {
      status: query.status,
      search: query.search,
      page: query.page,
      limit: query.limit,
    };

    if (user.role === "asesor") {
      options.ownerId = user.id;
    }

    return options;
  }

  async getAllClients(
    user: User,
    query: ClientQueryDto
  ): Promise<ClientsListResponseDto> {
    const options = this.getQueryOptionsForUser(user, query);
    const { clients, total } = await this.clientRepository.findAll(options);

    return {
      clients: clients.map((client) => this.toClientResponse(client)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getClientById(
    user: User,
    clientId: string
  ): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw errors.notFound("Cliente");
    }

    if (!this.canAccessClient(user, client)) {
      throw errors.forbidden();
    }

    return this.toClientResponse(client);
  }

  async createClient(
    user: User,
    dto: CreateClientDto
  ): Promise<ClientResponseDto> {
    if (user.role === "consulta") {
      throw errors.forbidden();
    }

    const documentExists = await this.clientRepository.existsByDocument(
      dto.documentType,
      dto.documentNumber
    );
    if (documentExists) {
      throw errors.documentExists();
    }

    const client = await this.clientRepository.create({
      ...dto,
      ownerId: user.id,
    });

    this.emailService
      .sendClientCreated(client)
      .catch((err) =>
        console.error("Error al enviar email de creación de cliente:", err)
      );

    return this.toClientResponse(client);
  }

  async updateClient(
    user: User,
    clientId: string,
    dto: UpdateClientDto
  ): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw errors.notFound("Cliente");
    }

    if (!this.canModifyClient(user, client)) {
      throw errors.forbidden();
    }

    if (dto.documentType || dto.documentNumber) {
      const docType = dto.documentType || client.documentType;
      const docNumber = dto.documentNumber || client.documentNumber;

      const documentExists = await this.clientRepository.existsByDocument(
        docType,
        docNumber,
        clientId
      );
      if (documentExists) {
        throw errors.documentExists();
      }
    }

    const updatedClient = await this.clientRepository.update(clientId, dto);
    if (!updatedClient) {
      throw errors.notFound("Cliente");
    }

    if (dto.status && dto.status !== client.status) {
      this.emailService
        .sendClientStatusChanged(updatedClient, client.status)
        .catch((err) =>
          console.error("Error al enviar email de cambio de estado:", err)
        );
    }

    return this.toClientResponse(updatedClient);
  }

  async updateClientStatus(
    user: User,
    clientId: string,
    dto: UpdateStatusDto
  ): Promise<{ id: string; status: string; updatedAt: string }> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw errors.notFound("Cliente");
    }

    if (!this.canModifyClient(user, client)) {
      throw errors.forbidden();
    }

    const updatedClient = await this.clientRepository.update(clientId, {
      status: dto.status,
    });
    if (!updatedClient) {
      throw errors.notFound("Cliente");
    }

    this.emailService
      .sendClientStatusChanged(updatedClient, client.status)
      .catch((err) =>
        console.error("Error al enviar email de cambio de estado:", err)
      );

    return {
      id: updatedClient.id,
      status: updatedClient.status,
      updatedAt: updatedClient.updatedAt.toISOString(),
    };
  }

  async deleteClient(user: User, clientId: string): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw errors.notFound("Cliente");
    }

    if (!this.canModifyClient(user, client)) {
      throw errors.forbidden();
    }

    const deleted = await this.clientRepository.softDelete(clientId);
    if (!deleted) {
      throw errors.notFound("Cliente");
    }

    this.emailService
      .sendClientDeleted(client)
      .catch((err) =>
        console.error("Error al enviar email de eliminación de cliente:", err)
      );
  }

  async exportClients(
    user: User,
    query: Omit<ClientQueryDto, "page" | "limit">
  ): Promise<string> {
    if (user.role === "consulta") {
      throw errors.forbidden();
    }

    const options: Omit<ClientQueryOptions, "page" | "limit"> = {
      status: query.status,
      search: query.search,
    };

    if (user.role === "asesor") {
      options.ownerId = user.id;
    }

    const clients = await this.clientRepository.findAllForExport(options);

    const fields = [
      { label: "ID", value: "id" },
      { label: "Nombre Completo", value: "fullName" },
      { label: "Tipo Documento", value: "documentType" },
      { label: "Numero Documento", value: "documentNumber" },
      { label: "Email", value: "email" },
      { label: "Telefono", value: "phone" },
      { label: "Ciudad", value: "city" },
      { label: "Direccion", value: "address" },
      { label: "Fecha Nacimiento", value: "birthDate" },
      { label: "Estado", value: "status" },
      { label: "ID Propietario", value: "ownerId" },
      {
        label: "Fecha Creacion",
        value: (row: Client) => row.createdAt.toISOString(),
      },
      {
        label: "Fecha Actualizacion",
        value: (row: Client) => row.updatedAt.toISOString(),
      },
    ];

    const parser = new Parser({ fields });
    return parser.parse(clients);
  }

  private canAccessClient(user: User, client: Client): boolean {
    if (user.role === "admin") return true;
    if (user.role === "asesor") return client.ownerId === user.id;
    if (user.role === "consulta") return true;
    return false;
  }

  private canModifyClient(user: User, client: Client): boolean {
    if (user.role === "admin") return true;
    if (user.role === "asesor") return client.ownerId === user.id;
    return false;
  }
}
