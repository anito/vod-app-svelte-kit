import type { SvelteComponentTyped } from 'svelte';

export interface DropzoneProps<DropzoneType> {
  dropzoneEvents: any;
  options: any;
  style: string;
  dropzoneClass: string;
  hoveringClass: string;
  autoDiscover: boolean;
  id: string;
}

export class Dropzone extends SvelteComponentTyped<DropzoneProps> {}
