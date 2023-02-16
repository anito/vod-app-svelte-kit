import { Repo } from './repo';

export class UsersRepo extends Repo {
  endpoint: string;

  private static instance: UsersRepo;

  constructor() {
    super();
    this.endpoint = 'users';
    this.limit = 8;
  }

  public static getInstance = (): UsersRepo =>
    UsersRepo.instance || (UsersRepo.instance = new UsersRepo());
}
