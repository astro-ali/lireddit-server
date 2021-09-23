import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
require('dotenv').config();

const port = process.env.PORT || 5000

const main = async () => {
  // connect to db
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
        resolvers: [HelloResolver, PostResolver, UserResolver],
        validate: false,
    }),
    context: () => ({ em: orm.em })
  });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
  
  app.listen(port, () => {
      console.log(`Running on localhost:${port}`);
  });
};

main().catch((err) => {
  console.error(err);
});
