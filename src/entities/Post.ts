import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Post {

  @PrimaryKey()
  id!: number;
  
  @Property({ type: "text" })
  name!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

}