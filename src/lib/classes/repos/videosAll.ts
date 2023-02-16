import { Repo } from './repo';

export class VideosAllRepo extends Repo {
  endpoint: string;

  private static instance: VideosAllRepo;

  constructor() {
    super();
    this.endpoint = 'videos/all';
    this.limit = 9;
  }

  public static getInstance = (): VideosAllRepo =>
    VideosAllRepo.instance || (VideosAllRepo.instance = new VideosAllRepo());
}
