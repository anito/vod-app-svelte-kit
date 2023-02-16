interface RepoGetAllOptions {
  page?: number;
  limit?: number;
  token: string;
  match?: any;
}

export interface Repo<RepoType = Record<string, void>> {
  get: (id: string, { token: string }) => User;
  getAll: ({}: RepoGetAllOptions) => { success: boolean; data: never[]; pagination: Pagination };
  setToken: (token: string) => void;
}

export interface User<UserRepoType = Record<any, any>> {
  name: string;
  email: string;
  id: string;
  jwt: string;
  role: string;
  expires: number;
  token_id: string;
  protected: boolean;
  active: boolean;
  group_id: string;
  message?: string;
  avatar: Avatar[] | any;
  videos: Video[] | any;
  groups: Group[] | any;
}

export interface UserFoundation<UserFoundationType = Record<any, any>> {
  id: string;
  name: string;
  email: string;
  group_id: string;
  avatar: Avatar[] | any;
}

export interface Image<ImageRepoType = Record<string, any>> {
  id: string | any;
  src: string;
  videos: Video[];
  created: string | number | Date;
}

export interface Avatar<AvatarRepoType = Record<string, any>> {
  id: string | any;
  user_id: string | any;
  src: string | any;
}

export interface Video<VideoRepoType = Record<string, any>> extends VideoAll {
  src?: string | any;
  playhead?: number | any;
  _joinData?: any[] | any;
  _matchingData?: any[] | any;
}

export interface VideoAll<VideoAllRepoType = Record<string, any>> {
  id: string | any;
  title: string;
  description: string | never;
  image: Image | any;
  image_id: string | any;
  duration?: number | null;
  created: string | number | Date;
}

export interface Pagination<PaginationType = Record<string, any>> {
  count: null;
  page_count: number;
  current_page: number;
  has_next_page: boolean;
  limit: number;
}
