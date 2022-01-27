import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"

import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { CreateUserError } from "./CreateUserError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User Use Case', () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  })

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      email: 'user@user.com',
      name: 'John Doe',
      password: 'johndoepassword'
    })

    expect(user).toHaveProperty('id')
  })

  it('should not be able to create a new user with an email that already exists', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: 'janedoe@user.com',
        name: 'Jane Doe',
        password: 'janedoepassword'
      })

      await createUserUseCase.execute({
        email: 'janedoe@user.com',
        name: 'Jane Doe',
        password: 'janedoepassword'
      })
    }).rejects.toBeInstanceOf(CreateUserError)
  })
})
