import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"

import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: InMemoryUsersRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User Use Case', () => {
  let user: User;

  let userData = {
    email: 'user@user.com',
    name: 'John Doe',
    password: 'johndoepassword'
  }

  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);

    user = await createUserUseCase.execute(userData);
  })

  it('should be able to authenticate the user', async () => {
    const userAuthenticated = await authenticateUserUseCase.execute(
      {
        email: user.email,
        password: userData.password
      }
    );

    expect(userAuthenticated).toHaveProperty('token')
    expect(userAuthenticated).toHaveProperty('user')
    expect(userAuthenticated.user).toHaveProperty('id')
    expect(userAuthenticated.user).toHaveProperty('name')
    expect(userAuthenticated.user).toHaveProperty('email')
  })

  it('should not be able to authenticate user with an invalid email', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute(
        {
          email: 'invalid-email@invalidemail.com',
          password: user.password
        }
      );
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it('should not be able to authenticate user with an invalid password', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute(
        {
          email: user.email,
          password: 'invalid-password'
        }
      );
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
