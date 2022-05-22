// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {

    const { subscribe, update, set } = writable( [], () => {} )

    let findIndex = ( id, items ) => {
        return items.findIndex( itm => itm.id == id )
    }

    return {
        subscribe,
        add: ( val ) => update( ( items ) => {
            return findIndex( val.id, items ) == -1 && [ ...items, val ] || items;
        } ),
        put: ( id ) => update( items => {
            const index = findIndex( id, items )
            return [...items.slice(0, index), { ...items[index], ...item }, ...items.slice(index + 1)]
        } ),
        del: ( id ) => update( ( items ) => items.filter( ( itm ) => itm.id !== id ) ),
        update: ( val ) => update( () => val ),
        set
    }

}

export const avatars = createStore();