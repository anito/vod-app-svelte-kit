import { Repo } from './repo';

export class ImagesRepo extends Repo {
  endpoint: string;

  private static instance: ImagesRepo;

  constructor() {
    super();
    this.endpoint = 'images';
  }

  public static getInstance = (): ImagesRepo =>
    ImagesRepo.instance || (ImagesRepo.instance = new ImagesRepo())
}
