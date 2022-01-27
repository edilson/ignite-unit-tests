import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"

import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from './GetBalanceUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get Balance Use Case', () => {
  let user: User;

  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory)

    user = await createUserUseCase.execute({
      email: 'user@user.com',
      name: 'John Doe',
      password: 'johndoepassword'
    });

    await createStatementUseCase.execute(
      {
        user_id: user.id as string,
        amount: 500,
        description: 'monthly deposit',
        type: OperationType.DEPOSIT
      }
    );

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
        amount: 100,
        description: 'cellphone payment',
        type: OperationType.WITHDRAW
      }
    );

    await createStatementUseCase.execute(
      {
        user_id: user.id as string,
        amount: 250,
        description: 'monthly deposit',
        type: OperationType.DEPOSIT
      }
    );

    await createStatementUseCase.execute(
      {
        user_id: user.id as string,
        amount: 150,
        description: 'rent payment',
        type: OperationType.WITHDRAW
      }
    );
  })

  it('should be able to get the user balance', async () => {
    const { balance, statement } = await getBalanceUseCase.execute({ user_id: user.id as string })

    expect(balance).toEqual(700)
    expect(statement).toHaveLength(5)
  })

  it('should not be able to create a statement whe the user does not exist', async () => {
    expect(async () => {
      await getBalanceUseCase.execute(
        {
          user_id: 'invalid-user-id'
        }
      );
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
