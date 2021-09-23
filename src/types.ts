import { IDatabaseDriver, Connection, EntityManager } from "@mikro-orm/core";
import { Request, Response, Express } from "express";

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request;
  res: Response;
};
