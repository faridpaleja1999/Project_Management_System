import { Column, Entity, OneToMany } from "typeorm";
import { CommonSchema } from "../utility/commonCol";
import { Task } from "./task";

@Entity()
export class Project  extends CommonSchema{
  @Column("varchar", { length: 255 })
  name!: string;

  @Column("varchar", { length: 255 })
  description!: string;

  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];
}
