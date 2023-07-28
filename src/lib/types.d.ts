import type { User } from './classes/repos/types';

declare global {
  interface Window {
    FB: any;
  }
  interface WindowEventMap {
    'dropzone:init': CustomEvent;
    'info:user:activate': CustomEvent;
    'info:token:generate': CustomEvent;
    'player:loadstart': CustomEvent;
    'player:emptied': CustomEvent;
    'player:canplay': CustomEvent;
    'player:aborted': CustomEvent;
    'player:loadeddata': CustomEvent;
    'player:rwd': CustomEvent;
    'session:validate': CustomEvent;
    'session:success': CustomEvent;
    'session:error': CustomEvent;
    'session:stop': CustomEvent;
    'user:save': CustomEvent;
    'user:delete': CustomEvent;
    'ui:mousemove': CustomEvent;
    'ui:touchstart': CustomEvent;
    'ui:pip': CustomEvent;
    'video:save': CustomEvent;
    'video:add': CustomEvent;
    'video:poster:changed': CustomEvent;
    'vercel:web-vital': CustomEvent;
    'media:delete': CustomEvent;
    'media:deleteMany': CustomEvent;
  }
  interface HTMLElementEventMap {
    'ui:show': CustomEvent;
  }

  interface Number {
    /**
     * Converts a number to formatted string with a length of minimumIntegerDigits.
     * Utilizes ECMAScript Internationalization API Specification, see https://tc39.es/ecma402/#sec-intl.datetimeformat.prototype.format
     * Default length is 2
     * @param minimumIntegerDigits
     */
    minimumIntegerDigits(minimumIntegerDigits?: number): string;
    minimumFractionDigits(minimumFractionDigits?: number): string;

    /**
     * Converts seconds to a formatted string in the form of"HH:MM:SS""
     * @returns string - The formatted string
     */
    toHHMMSS();
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

export interface Issue<IssuesType = Record<string, any>> {
  id: string;
  eventType: string;
  label: string;
  flag: string;
  type: string;
  reason: string;
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
  id?: string;
  name?: string;
  email?: string;
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
  id?: string;
  name?: string;
  slug?: string;
  protected?: boolean;
  subject?: string;
  ['before-content']?: string;
  ['content']?: string;
  ['after-content']?: string;
  ['before-sitename']?: string;
  ['after-sitename']?: string;
  ['before-footer']?: string;
  ['footer']?: string;
  ['after-footer']?: string;
  data?: any;
  items?: any[];
}

export interface Framework<FrameworkType = Record<string, any>> {
  name: string;
  icon: string;
  icontype: string;
  host: string;
  href: string;
  disabled?: boolean;
}

export interface Session<SessionType = Record<string, any>> {
  data?: Object;
  fromToken?: boolean;
  user?: User;
  role?: string;
  message?: string;
  success?: boolean;
  renewed?: boolean;
  code?: number;
  locale?: string;
  salutation?: string;
  _expires?: Date | any;
}

export interface Sent<SentType = Record<string, any>> {
  id: string;
}

export interface Inbox<InboxType = Record<string, any>> {
  id: string;
}

export interface Config<ConfigType = Record<string, any>> {
  Session: SessionConfig;
  Site: SiteConfig;
  Console: ConsoleConfig;
}

export interface SiteConfig<SiteConfigType = Record<string, any>> {
  defaultadmintab: string;
  defaultusertab: string;
  salutation: string;
  salutations: Array;
  name: string;
  description: string;
  logo: string;
}

export interface ConsoleConfig<ConsoleConfigType = Record<string, any>> {
  infoLevel: number;
  log: number;
}

export interface SessionConfig<SessionConfigType = Record<string, any>> {
  lifetime: string;
  logoutredirect: string;
}

export interface Error<ErrorType = Record<string, any>> {
  code: any;
  message: string;
}

export interface UploaderOptions<UploaderOptionsType = Recors<string, any>> {
  path: string;
  uploadMultiple: boolean;
  parallelUploads: number;
  maxFiles: number;
  timeout: number;
  maxFilesize: number;
  acceptedFiles?: string;
}

export interface Badge<BadgeType = Record<string, any>> {
  icon?: string;
  position?: 'TOP_RIGHT' | 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'TOP_LEFT';
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface DropzoneOptions<DropzoneOptionsType = Record<string, any>> {
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
  previewsContainer?: string;
  init?: () => void;
}

export interface Section {
  metadata: Metadata;
  html: string;
  slug: string;
  file: string;
  subsections: Subsection[];
}
export interface Subsection {
  slug: string;
  title: string;
  level: number;
}
export interface Metadata {
  title: string;
}
export interface LoginResponseData {
  user: User;
  groups: Group[];
  renewed: boolean;
  message: string;
}
