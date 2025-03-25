import { BeforeInsert, Column, Entity } from "typeorm";
import { UserType } from "../configs/constant";
import { CommonSchema } from "../utility/commonCol";
import { hashingString } from "../utility/utils";

@Entity()
export class User extends CommonSchema {
  @Column("varchar", { length: 255 })
  name!: string;

  @Column("varchar", { length: 255 })
  email!: string;

  @Column("varchar", { length: 255 })
  password!: string;

  @Column({
    type: "enum",
    enum: UserType,
    default : UserType.DEVELOPER
  })
  userType!: UserType;

  @BeforeInsert()
  async beforeInsert() {
    this.password = await hashingString(this.password);
  }
}
