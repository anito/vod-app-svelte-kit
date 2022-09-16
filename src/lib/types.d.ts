declare global {
  interface WindowEventMap {
    'ticker:start': CustomEvent;
    'ticker:started': CustomEvent;
    'ticker:end': CustomEvent;
    'ticker:extend': CustomEvent;
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

export interface User<UserType = Record<string, any>> {
  name: string
  email: string | undefined
  id: string
  jwt: string
  role: string
  expires: number
  token_id: string
  avatar: Avatar[]
  videos: Video[]
  groups: Group[]
}

export interface Group<GroupType = Record<string, any>> {
  id: string
  name: string
}

export interface Video<VideoType = Record<string, never>> {
  id: string | any
  title: string
  description: string | never
  image_id: string | any
  playhead: number | any
  _joinData: any[] | any
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

export interface Session<SessionType = Record<string, any>> {
  User: User
  start: Date | any
}

export interface VideoElement<VideoElementType = Record<string, any>> {
  node: HTMLVideoElement
  promise: any
}

// export interface Session<SessionType = Record<string, any>> {
//   data: SessionType;
//   expires: Date | undefined;
//   update: (updateFn: (data: SessionType) => Partial<SessionType> | Promise<Partial<SessionType>>) => Promise<SessionType>;
//   set: (data?: SessionType) => Promise<SessionType>;
//   refresh: (expires_in_days?: number) => Promise<boolean>;
//   destroy: () => Promise<boolean>;
// }