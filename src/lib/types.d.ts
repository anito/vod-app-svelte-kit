declare global {
  interface WindowEventMap {
    'session:success': CustomEvent;
    'session:error': CustomEvent;
    'session:stop': CustomEvent;
    'session:extend': CustomEvent;
    'player:loadstart': CustomEvent;
    'player:emptied': CustomEvent;
    'player:canplay': CustomEvent;
    'player:aborted': CustomEvent;
    'player:loadeddata': CustomEvent;
    'player:rwd': CustomEvent;
    'ui:mousemove': CustomEvent;
    'ui:touchstart': CustomEvent;
    'ui:pip': CustomEvent;
  }
}
export declare type EventType = keyof GlobalEventHandlersEventMap;
// export declare type SpecificEventListener<K extends EventType> = (evt: GlobalEventHandlersEventMap[K]) => void;
// export declare type CustomEventListener<E extends Event> = (evt: E) => void;
// export declare type WindowEventType = keyof WindowEventMap;
// export declare type SpecificWindowEventListener<K extends WindowEventType> = (evt: WindowEventMap[K]) => void;

export interface Repo<RepoType = Record<string, void>> {
  get: any
  getAll: any
  setToken: any
}

export interface User<UserType = Record<string, any>> {
  name: string;
  email: string;
  id: string;
  jwt: string;
  role: string;
  expires: number;
  token_id: string;
  protected: boolean
  active: boolean
  group_id: string
  avatar: Avatar[] | any;
  videos: Video[] | any;
  groups: Group[] | any;
}

export interface GoogleUser<GoogleUserType = Record<string, any>> {
  id: string
  name: string
  email: string | undefined
}

export interface Group<GroupType = Record<string, any>> {
  id: string
  name: string
}

export interface Video<VideoType = Record<string, any>> {
  id: string | any
  title: string
  description: string | never
  image: Image | any
  image_id: string | any
  src: string | any
  playhead: number | any
  _joinData: any[] | any
  _matchingData: any[] | any
  created: Date
}

export interface MailTemplate<TemplateType = Record<string, any>> {
  id: string | any
  name: string
  items: any
}

export interface Image<ImageType = Record<string, any>> {
  id: string | any
  src: string
}

export interface Avatar<AvatarType = Record<string, any>> {
  id: string | any
  user_id: string | any
  src: string | any
}

export interface Framework<FrameworkType = Record<string, any>> {
  name: string;
  icon: string;
  icontype: string;
  host: string;
  href: string;
  target: string;
  disabled?: boolean;
}

export interface Session<SessionType = Record<string, any>> {
  data: Object
  fromToken: boolean
  user: User
  role: string
  message: string
  success: boolean
  renewed: boolean
  code: number
  locale?: string
  _expires: Date | any
}

export interface Config<ConfigType = Record<string, any>> {
  Site: Site
  Console: any
  Session: any
}

export interface VideoEmitter<VideoEmitterType = Record<string, any>> {
  method: string
  data: Video | any
  show: boolean
}

export interface Sent<SentType = Record<string, any>> {
  id: string
}

export interface Inbox<InboxType = Record<string, any>> {
  id: string
}

export interface Setting<SettingType = Record<string, any>> {
  Session: any
  Site: Site | any
  Console: Console | any
}

export interface Site<SiteType = Record<string, any>> {
  defaultUserTab: boolean
  salutation: string
  salutations: Array
}

export interface Console<ConsoleType = Record<string, any>> {
  info: boolean
  log: boolean
}

export interface Error<ErrorType = Record<string, any>> {
  code: any
  message: string
}

export interface Editor<EditorType = Record<string, any>> {
  id: any,
  node: Element | any,
  value: any,
  editable: Element | any
}

export interface Dropzone<DropzoneType = Record<string, any>> {
  processQueue?: any
  removeFile?: any;
  url?: string | undefined;
  timeout?: number | undefined;
  paramName?: string | undefined;
  uploadMultiple?: boolean | undefined;
  maxFiles?: number | undefined;
  autoProcessQueue?: boolean | undefined;
  parallelUploads?: number | undefined;
  withCredentials?: boolean | undefined;
  thumbnailWidth?: number | undefined;
  thumbnailHeight?: number | undefined;
  clickable?: boolean | undefined;
  acceptedFiles?: any;
  maxFilesize?: number | undefined;
  previewTemplate?: any;
  init?: () => void;
}

// export interface Session<SessionType = Record<string, any>> {
//   data: SessionType;
//   expires: Date | undefined;
//   update: (updateFn: (data: SessionType) => Partial<SessionType> | Promise<Partial<SessionType>>) => Promise<SessionType>;
//   set: (data?: SessionType) => Promise<SessionType>;
//   refresh: (expires_in_days?: number) => Promise<boolean>;
//   destroy: () => Promise<boolean>;
// }