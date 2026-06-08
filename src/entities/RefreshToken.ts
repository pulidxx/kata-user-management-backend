import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity("refresh_tokens")
@Index(["token"])
@Index(["expiresAt"])
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 500 })
  token!: string;

  @Column({ type: "timestamp" })
  expiresAt!: Date;

  @Column({ type: "boolean", default: false })
  revoked!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;
}
