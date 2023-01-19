declare global {
  interface WindowEventMap {
    'session:success': CustomEvent;
    'session:error': CustomEvent;
    'session:stop': CustomEvent;
    'session:extend': CustomEvent;
    'video:save': CustomEvent;
    'video:add': CustomEvent;
    'video:delete': CustomEvent;
    'user:save': CustomEvent;
    'user:delete': CustomEvent;
    'player:loadstart': CustomEvent;
    'player:emptied': CustomEvent;
    'player:canplay': CustomEvent;
    'player:aborted': CustomEvent;
    'player:loadeddata': CustomEvent;
    'player:rwd': CustomEvent;
    'ui:mousemove': CustomEvent;
    'ui:touchstart': CustomEvent;
    'ui:pip': CustomEvent;
    'info:user:activate': CustomEvent;
    'info:token:generate': CustomEvent;
  }

  interface Number {
    /**
     * Converts a number to formatted string with a length of minimumIntegerDigits.
     * Utilizes ECMAScript Internationalization API Specification, see https://tc39.es/ecma402/#sec-intl.datetimeformat.prototype.format
     * Default length is 2
     * @param minimumIntegerDigits
     */
    minDigits(minimumIntegerDigits?: number): string;
  }

  interface Array {
    /**
     * Remove any multiple occurances from an array
     */
    unique();
    /**
     * Sorting of Array Object Items by Object.key
     */
    sortBy(key);
  }

  interface String {
    /**
     * Remove all full-word occurances of the specifyed string from a string
     * @param val The text to remove the given value from
     */
    remove(val: string);
    /**
     * Add all full-word occurances of val from a text
     * @param val The text to remove the given value from
     */
    add(val: string);
  }
}
export declare type EventType = keyof GlobalEventHandlersEventMap;
// export declare type SpecificEventListener<K extends EventType> = (evt: GlobalEventHandlersEventMap[K]) => void;
// export declare type CustomEventListener<E extends Event> = (evt: E) => void;
// export declare type WindowEventType = keyof WindowEventMap;
// export declare type SpecificWindowEventListener<K extends WindowEventType> = (evt: WindowEventMap[K]) => void;

export interface Repo<RepoType = Record<string, void>> {
  get: any;
  getAll: any;
  setToken: any;
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

export interface Issue<IssuesType = Record<string, any>> {
  id: string;
  eventType: string;
  label: string;
  flag: string;
  type: string;
  reason: string;
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
}

export interface Avatar<AvatarRepoType = Record<string, any>> {
  id: string | any;
  user_id: string | any;
  src: string | any;
}

export interface Video<VideoRepoType = Record<string, any>> {
  id: string | any;
  title?: string;
  description?: string | never;
  image?: Image | any;
  image_id?: string | any;
  src?: string | any;
  playhead?: number | any;
  _joinData?: any[] | any;
  _matchingData?: any[] | any;
  created: string | number | Date;
}

export interface VideoAll<VideoAllRepoType = Record<string, any>> {
  id: string | any;
  title: string;
  description: string | never;
  image: Image | any;
  image_id: string | any;
  src: string | any;
  created?: string | number | Date;
}

export interface Stream {
  received?: number;
  total?: number;
  percent?: number;
  chunks?: Uint8Array[];
  controller?: ReadableStreamDefaultController<any>;
  reader?: ReadableStreamDefaultReader<Uint8Array>;
}

export interface IndexedStream<IndexedStreamType = Record<string, any>> {
  id: string;
  stream: Stream;
}

export interface GoogleUser<GoogleUserType = Record<string, any>> {
  id: string;
  name: string;
  email: string | undefined;
}

export interface Group<GroupType = Record<string, any>> {
  id: string;
  name: string;
}

export interface Mail<MailType = Record<string, any>> {
  id: string | any;
  message: string;
  subject: string;
  _from: string | any;
  _to: string | any;
  _read: boolean;
  created: Date;
}

export interface MailTemplate<TemplateType = Record<string, any>> {
  id: string;
  name?: string;
  slug?: string;
  protected?: boolean;
  items: any[];
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
  data: Object;
  fromToken: boolean;
  user: User;
  role: string;
  message: string;
  success: boolean;
  renewed: boolean;
  code: number;
  locale?: string;
  _expires: Date | any;
}

export interface Sent<SentType = Record<string, any>> {
  id: string;
}

export interface Inbox<InboxType = Record<string, any>> {
  id: string;
}

export interface Setting<SettingType = Record<string, any>> {
  Session: SessionSettings;
  Site: SiteSettings;
  Console: ConsoleSettings;
}

export interface SiteSettings<SiteSettingsType = Record<string, any>> {
  defaultAdminTab: string;
  salutation: string;
  salutations: Array;
  name: string;
  description: string;
  logo: string;
}

export interface ConsoleSettings<ConsoleSettingsType = Record<string, any>> {
  infoLevel: number;
  log: number;
}

export interface SessionSettings<SessionSettingsType = Record<string, any>> {
  lifetime: number;
}

export interface Error<ErrorType = Record<string, any>> {
  code: any;
  message: string;
}

export interface Dropzone<DropzoneType = Record<string, any>> {
  processQueue?: any;
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
