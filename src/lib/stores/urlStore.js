import { writable } from 'svelte/store';

function createStore() {

    const { subscribe, update, set } = writable( new Map(), (  ) => {} )
    let param = (items, item) => {
        let value = items.has(item.id) && items.get(item.id) || {[item.params]: item.url};
        !value[item.params] && (value[item.params] = item.url);
        items.set(item.id, value);
        return items;
    }
    return {
        subscribe,
        add: (item) => update( items => param(items, item)),
        del: (id) => update(items => items.delete(id) && items || items),
        put: (item) => update(items => items.has(item.id) && items.set(item.id, item) && items || items),
        set
    }

}

export const urls = createStore();