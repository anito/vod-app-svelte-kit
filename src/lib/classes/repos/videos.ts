import { Repo } from './repo';

export class VideosRepo extends Repo {
  endpoint: string;

  private static instance: VideosRepo;

  constructor() {
    super();
    this.endpoint = 'videos';
  }

  public static getInstance = (): VideosRepo =>
    VideosRepo.instance || (VideosRepo.instance = new VideosRepo())
}
