import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"

import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get Statement Operation Use Case', () => {
  let user: User;

  let statement: Statement;

  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)

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

    statement = await createStatementUseCase.execute(
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
  })

  it('should be able to get the statement operation', async () => {
    const statementOperation = await getStatementOperationUseCase.execute({ user_id: user.id as string, statement_id: statement.id as string })

    expect(statementOperation).toHaveProperty('id')
  })

  it('should not be able to return a statement operation when the user does not exist', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute(
        {
          user_id: 'invalid-user-id',
          statement_id: statement.id as string
        }
      );
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it('should not be able to return a statement operation when the statement does not exist', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute(
        {
          user_id: user.id as string,
          statement_id: 'invalid-statement-id'
        }
      );
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
