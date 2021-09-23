import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";
require("dotenv").config();

const port = process.env.PORT || 5000;

const main = async () => {
  // connect to db
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  redisClient.on('connect', () => console.log('connected to redis successfully')); 

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        // httpOnly: true,
        // sameSite: "lax", // csrf
        // secure: __prod__, // cookies only work in https
      },
      saveUninitialized: false,
      secret: "potatos",
      resave: false,
    })
  );

  // redisClient.on('error', console.error);

  const requestOptions = {
    credentials: true,
    origin: "https://studio.apollographql.com",
  };

  app.use(cors(requestOptions));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(port, () => {
    console.log(`Running on localhost:${port}`);
  });
};

main().catch((err) => {
  console.error(err);
});
