import { Repository, ILike, In } from "typeorm";
import { AppDataSource } from "../../../ormconfig";
import { Client, ClientStatus, DocumentType } from "../../../entities";

export interface ClientQueryOptions {
  status?: ClientStatus;
  search?: string;
  page: number;
  limit: number;
  ownerId?: string;
  clientIds?: string[];
}

export class ClientRepository {
  private repository: Repository<Client>;

  constructor() {
    this.repository = AppDataSource.getRepository(Client);
  }

  async findById(id: string): Promise<Client | null> {
    return this.repository.findOne({
      where: { id, deletedAt: null as any },
      relations: ["owner"],
    });
  }

  async findAll(
    options: ClientQueryOptions,
  ): Promise<{ clients: Client[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder("client")
      .leftJoinAndSelect("client.owner", "owner")
      .where("client.deletedAt IS NULL");

    if (options.ownerId) {
      queryBuilder.andWhere("client.ownerId = :ownerId", {
        ownerId: options.ownerId,
      });
    }

    if (options.clientIds && options.clientIds.length > 0) {
      queryBuilder.andWhere("client.id IN (:...clientIds)", {
        clientIds: options.clientIds,
      });
    } else if (options.clientIds && options.clientIds.length === 0) {
      return { clients: [], total: 0 };
    }

    if (options.status) {
      queryBuilder.andWhere("client.status = :status", {
        status: options.status,
      });
    }

    if (options.search) {
      queryBuilder.andWhere(
        "(client.fullName ILIKE :search OR client.email ILIKE :search OR client.documentNumber ILIKE :search)",
        { search: `%${options.search}%` },
      );
    }

    const total = await queryBuilder.getCount();

    const skip = (options.page - 1) * options.limit;
    queryBuilder
      .orderBy("client.createdAt", "DESC")
      .skip(skip)
      .take(options.limit);

    const clients = await queryBuilder.getMany();

    return { clients, total };
  }

  async findAllForExport(
    options: Omit<ClientQueryOptions, "page" | "limit">,
  ): Promise<Client[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("client")
      .leftJoinAndSelect("client.owner", "owner")
      .where("client.deletedAt IS NULL");

    if (options.ownerId) {
      queryBuilder.andWhere("client.ownerId = :ownerId", {
        ownerId: options.ownerId,
      });
    }

    if (options.clientIds && options.clientIds.length > 0) {
      queryBuilder.andWhere("client.id IN (:...clientIds)", {
        clientIds: options.clientIds,
      });
    } else if (options.clientIds && options.clientIds.length === 0) {
      return [];
    }

    if (options.status) {
      queryBuilder.andWhere("client.status = :status", {
        status: options.status,
      });
    }

    if (options.search) {
      queryBuilder.andWhere(
        "(client.fullName ILIKE :search OR client.email ILIKE :search OR client.documentNumber ILIKE :search)",
        { search: `%${options.search}%` },
      );
    }

    return queryBuilder.orderBy("client.createdAt", "DESC").getMany();
  }

  async create(clientData: Partial<Client>): Promise<Client> {
    const client = this.repository.create(clientData);
    return this.repository.save(client);
  }

  async update(
    id: string,
    clientData: Partial<Client>,
  ): Promise<Client | null> {
    await this.repository.update(id, clientData);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async existsByDocument(
    documentType: DocumentType,
    documentNumber: string,
    excludeId?: string,
  ): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder("client")
      .where("client.documentType = :documentType", { documentType })
      .andWhere("client.documentNumber = :documentNumber", { documentNumber })
      .andWhere("client.deletedAt IS NULL");

    if (excludeId) {
      queryBuilder.andWhere("client.id != :excludeId", { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async findByIds(ids: string[]): Promise<Client[]> {
    if (ids.length === 0) return [];
    return this.repository.find({
      where: { id: In(ids), deletedAt: null as any },
    });
  }

  async countByOwnerId(ownerId: string): Promise<number> {
    return this.repository.count({
      where: { ownerId, deletedAt: null as any },
    });
  }

  async updateOwner(fromOwnerId: string, toOwnerId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(Client)
      .set({ ownerId: toOwnerId })
      .where("ownerId = :fromOwnerId", { fromOwnerId })
      .execute();
    return result.affected ?? 0;
  }

  async softDeleteByOwnerId(ownerId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .softDelete()
      .from(Client)
      .where("ownerId = :ownerId", { ownerId })
      .execute();
    return result.affected ?? 0;
  }
}
