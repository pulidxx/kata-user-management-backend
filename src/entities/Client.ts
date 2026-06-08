import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";

export type DocumentType = "CC" | "CE" | "TI" | "PAS" | "NIT";

export type ClientStatus =
  | "Contactado"
  | "En Validación"
  | "Activo"
  | "Inactivo"
  | "Rechazado";

@Entity("clients")
@Index("IDX_client_document_unique", ["documentType", "documentNumber"], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Index(["ownerId"])
@Index(["status"])
@Index(["createdAt"])
export class Client {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  fullName!: string;

  @Column({
    type: "enum",
    enum: ["CC", "CE", "TI", "PAS", "NIT"],
  })
  documentType!: DocumentType;

  @Column({ type: "varchar", length: 50 })
  documentNumber!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 20 })
  phone!: string;

  @Column({ type: "varchar", length: 100 })
  city!: string;

  @Column({ type: "varchar", length: 500 })
  address!: string;

  @Column({ type: "date" })
  birthDate!: string;

  @Column({
    type: "enum",
    enum: ["Contactado", "En Validación", "Activo", "Inactivo", "Rechazado"],
    default: "Contactado",
  })
  status!: ClientStatus;

  @Column({ type: "uuid", nullable: true })
  ownerId!: string | null;

  @ManyToOne(() => User, (user) => user.clients, { onDelete: "SET NULL" })
  @JoinColumn({ name: "ownerId" })
  owner!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;
}
