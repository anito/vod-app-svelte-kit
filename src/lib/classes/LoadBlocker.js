// @ts-nocheck

const Tabs = new Map();

class Tab {
	constructor(args) {
		this.store = { ...args.store };
		this._blocker = args.blocker;
		this._active = false;
		this._loaded = false;
	}

	set active(val) {
		this._activate(val);
	}
	get active() {
		return this._active;
	}
	set loaded(val) {
		this._blocker.forEach((tab) => (tab._loaded = !val));
		this._loaded = val;
	}
	get loaded() {
		return this._loaded;
	}
}
class LoadBlocker extends Map {
	constructor(tabs) {
		super();
		if (!(tabs instanceof Array)) {
			tabs = Array.from(tabs);
		}
		tabs.forEach((tab) => {
			this.set(tab.slug, new Tab({ store: { ...tab.store }, blocker: this }));
		});
	}

	static list() {
		this.forEach((tab) => console.log(tab, tab.active));
	}
	canLoad(slug) {
		let tab = this.get(slug);

		// console.log(
		// 	`Class TAB: Tab ${slug} is ${(!tab?._loaded && 'NOT') || ''} blocked ${
		// 		(tab?._loaded && ':)') || ':('
		// 	}`
		// );
		if (tab) {
			return !tab?._loaded;
		}
	}
	activate(slug) {
		this.forEach((tab) => {
			tab._active = tab.slug === slug;
		});
	}
	loaded(slug) {
		let tab = this.get(slug);
		tab && (tab.loaded = true);
	}
}
export { LoadBlocker };
