import { Repository } from "typeorm";
import { AppDataSource } from "../../../ormconfig";
import { User } from "../../../entities";

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.id = :id", { id })
      .getOne();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("LOWER(user.email) = LOWER(:email)", { email })
      .getOne();
  }

  async findAll(): Promise<User[]> {
    return this.repository.find({
      order: { createdAt: "DESC" },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }
}
