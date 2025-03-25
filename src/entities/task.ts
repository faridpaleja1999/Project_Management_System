import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { TaskPriority, TaskStatus } from "../configs/constant";
import { CommonSchema } from "../utility/commonCol";
import { Project } from "./project";

@Entity()
export class Task extends CommonSchema {
  @Column("varchar", { length: 255 })
  title!: string;

  @Column("varchar", { length: 255 })
  description!: string;

  @Column({
    type: "int",
    nullable: true,
  })
  assigned_to!: number; // Dummy user ID

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @Column({
    type: "enum",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @ManyToOne(() => Project, (project) => project.tasks)
  @JoinColumn({ name: "project_id" })
  project!: Project;

}
