export class Editor {
  id: string | null;
  node: any;
  previous: any;
  value: any;
  editable: HTMLElement;

  private static instance: Editor;

  constructor({id, node, editable}: {
    id: string | null,
    node: any,
    editable?: HTMLElement,
  }) {

    this.id = id;
    this.node = node;
    this.editable = this.node.querySelector('.editable')
    this.value = this.editable.innerText

  }

  makeEditable() {
    console.log(this)
    const range = document.createRange();
    const selection = window.getSelection();

    if (this.editable !== null) {
      this?.editable?.classList.remove('editor');

      this.activate()
      range.selectNodeContents(this?.node);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    return this;
   }
  
  saveEditable(event: MouseEvent | KeyboardEvent | CustomEvent) {
    this.cancelEvent(event);
    
    this.deactivate()

    // let success;
    // if (this.value !== this.node.innerText) {
    //   success = await saveTemplateName();
    //   !success && restoreTemplateName();
    // }

    this.id = null;
  }

  cancelEditable(event: MouseEvent | KeyboardEvent | CustomEvent) {
    this.deactivate()
    // restoreTemplateName();

    this.id = null;
  }
  
  cancelEvent(event: MouseEvent | KeyboardEvent | CustomEvent) {
    event.stopPropagation?.();
    event.preventDefault?.();
  }

  activate() {
    this.editable.classList.add('editor');
    this.editable.setAttribute('contenteditable', 'true');
    this.editable.addEventListener('keydown', (event: KeyboardEvent) => this.keyListener(event as KeyboardEvent));
    this.editable.addEventListener('click', (event: MouseEvent) => this.cancelEvent(event as MouseEvent));
    this.editable.focus();
  }

  deactivate() {
    this.editable.classList.remove('editor');
    this.editable.setAttribute('contenteditable', 'false');
    this.editable.removeEventListener('keydown', (event: KeyboardEvent) => this.keyListener(event as KeyboardEvent));
    this.editable.removeEventListener('click', (event: MouseEvent) => this.cancelEvent(event as MouseEvent));
    this.node?.classList.remove('hover');
    this.id = null
  }

  keyListener(event: KeyboardEvent) {
    event.stopPropagation();
    console.log('keyboard')
    
    if (event.key === 'Enter') {
      console.log('Enter')
      this.saveEditable(event);
    }
    if (event.key === 'Escape') {
      this.cancelEditable(event);
    }
  }
}