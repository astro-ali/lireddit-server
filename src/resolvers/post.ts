import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, {nullable: true})
  post(
      @Arg("id") id: number,
      @Ctx() { em }: MyContext
      ): Promise<Post | null> {
    return em.findOne(Post, {id});
  }

  @Mutation(() => Post)
  async createPost(
      @Arg("name") name: string,
      @Ctx() { em }: MyContext
      ): Promise<Post> {
    const post = em.create(Post, {name});
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, {nullable: true})
  async updatePost(
      @Arg("id") id: number,
      @Arg("name", () => String, {nullable: true}) name: string,
      @Ctx() { em }: MyContext
      ): Promise<Post | null> {
    const post = await em.findOne(Post, {id});
    if(!post) {
        return null;
    }
    if(!name) return post;
    if(typeof name !== 'undefined'){
        post.name = name;
        em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
      @Arg("id") id: number,
      @Ctx() { em }: MyContext
      ): Promise<boolean> {
    try {
        await em.nativeDelete(Post, {id});
    } catch (error) {
        return false;
    }
    return true;
  }
}
