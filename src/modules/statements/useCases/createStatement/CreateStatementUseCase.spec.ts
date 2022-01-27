import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"

import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe('Create Statement Use Case', () => {
  let user: User;

  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)

    user = await createUserUseCase.execute({
      email: 'user@user.com',
      name: 'John Doe',
      password: 'johndoepassword'
    });
  })

  it('should be able to create a statement', async () => {
    const statementCreated = await createStatementUseCase.execute(
      {
        user_id: user.id as string,
        amount: 500,
        description: 'monthly deposit',
        type: OperationType.DEPOSIT
      }
    );

    expect(statementCreated).toHaveProperty('id')
  })

  it('should not be able to create a statement whe the user does not exist', async () => {
    expect(async () => {
      await createStatementUseCase.execute(
        {
          user_id: 'invalid-user-id',
          amount: 200,
          description: 'monthly deposit',
          type: OperationType.DEPOSIT
        }
      );
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it('should not be able to make a withdraw when there is not enough balance', async () => {
    expect(async () => {
      await createStatementUseCase.execute(
        {
          user_id: user.id as string,
          amount: 200,
          description: 'monthly deposit',
          type: OperationType.DEPOSIT
        }
      );

      await createStatementUseCase.execute(
        {
          user_id: user.id as string,
          amount: 300,
          description: 'withdraw to pay the rent',
          type: OperationType.WITHDRAW
        }
      );
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
