import { Repo } from './repo';

export class VideosAllRepo extends Repo {
  endpoint: string;

  private static instance: VideosAllRepo;

  constructor() {
    super();
    this.endpoint = 'videos/all';
  }

  public static getInstance(): VideosAllRepo {
    if (!VideosAllRepo.instance) {
      VideosAllRepo.instance = new VideosAllRepo();
    }
    return VideosAllRepo.instance;
  }
}
