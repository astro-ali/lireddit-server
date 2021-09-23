import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
const bcrypt = require("bcryptjs");

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  /**
   * register resolver
   * @param options
   * @param em
   * @returns UserResponse
   */
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {

    if(options.username.length === 0){
        return {
            errors:[
                {
                    field: "username",
                    message: "username field is empty"
                }
            ]
        }
    }

    if(options.password.length <= 3){
        return {
            errors:[
                {
                    field: "password",
                    message: "length must be greater than 3"
                }
            ]
        }
    }

    let oldUser = await em.findOne(User, { username: options.username });
    if(oldUser){
        return {
            errors: [
                {
                    field: "username",
                    message: "username already taken",
                }
            ]
        }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(options.password, salt);
    let user: User = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);

    return {
        user
    };
  }

  /**
   * login resolver
   * @param options
   * @param param1
   * @returns UserResponse
   */
  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    let user: any = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "user does not exist",
          },
        ],
      };
    }
    const valid = await bcrypt.compare(options.password, user.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "password is incorrect",
          },
        ],
      };
    }
    return {
      user,
    };
  }
}
