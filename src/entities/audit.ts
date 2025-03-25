import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";
import { AuditAction, AuditEntity } from "../configs/constant";

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("enum", { enum: AuditEntity })
  entity!: string;

  @Column("enum", { enum: AuditAction })
  action!: string; 

  @Column()
  changedBy!: number; 

  @CreateDateColumn()
  changedAt!: Date;

  @CreateDateColumn({ type: "timestamp", nullable: true })
  createdAt!: Date | null;

  @Column("json", { nullable: true })
  details!: object; 
}
