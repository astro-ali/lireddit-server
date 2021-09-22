import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  // connect to db
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
        resolvers: [HelloResolver, PostResolver],
        validate: false,
    }),
    context: () => ({ em: orm.em })
  });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
  
  app.listen(5000, () => {
      console.log(`Running on localhost:5000`);
  });
};

main().catch((err) => {
  console.error(err);
});
