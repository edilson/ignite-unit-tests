import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"

import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { User } from "../../entities/User";
import { ShowUserProfileError } from "./ShowUserProfileError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Show User Profile Use Case', () => {
  let user: User;

  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();

    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    user = await createUserUseCase.execute({
      email: 'user@user.com',
      name: 'John Doe',
      password: 'johndoepassword'
    })
  })

  it('should be able to show the user profile', async () => {
    const userProfile = await showUserProfileUseCase.execute(user.id as string)

    expect(userProfile).toHaveProperty('id')
    expect(userProfile.email).toEqual(user.email)
    expect(userProfile.name).toEqual(user.name)
    expect(userProfile.password).toEqual(user.password)
  })

  it('should not be able to show the profile of a user that does not exists', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('invalid-user-id')
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
