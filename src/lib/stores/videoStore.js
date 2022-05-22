import { writable } from 'svelte/store';

function createStore() {

    const { subscribe, update, set } = writable( [], () => {} )

    let findIndexById = ( id, items ) => {
        return items.findIndex( itm => itm.id == id )
    }

    return {
        subscribe,
        add: ( val ) => update( ( items ) => [ ...items, ...val ] ),
        put: (val) => update(items => {
            const index = findIndexById( val.id, items )
            return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)]
        } ),
        del: ( id ) => update(items => items.filter( itm => itm.id !== id )),
        update: (val) => update(items => val),
        set
    }

}

export const videos = createStore();