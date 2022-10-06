export class Editor {
  id: any;
  node: Element | any;
  value: any;
  editable: Element | any;

  private static instance: Editor;

  constructor({id, node, value, editable}: {
    id: string,
    node: Element | null,
    value: string,
    editable: Element | null
  }) {
    this.id = id;
    this.node = node;
    this.value = value;
    this.editable = editable;

  }

  public static getInstance = (): Editor =>
    Editor.instance || (Editor.instance = new Editor())
}