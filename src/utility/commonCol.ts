import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class CommonSchema extends BaseEntity {
  @PrimaryGeneratedColumn() //if we want incremented id
  id!: number;

  @CreateDateColumn({ type: "timestamp", nullable: true })
  createdAt!: Date | null;

  @UpdateDateColumn({ type: "timestamp", nullable: true })
  updatedAt!: Date | null;

  @Column({
    type: "bool",
    default: true,
  })
  isActive!: boolean;

  @DeleteDateColumn({
    type: "timestamp",
    default: null,
  })
  deletedAt!: Date | null;

  @Column("varchar", {
    nullable: true,
  })
  createdBy!: number | null;

  @Column("varchar", {
    nullable: true,
  })
  updatedBy!: number | null;
}
