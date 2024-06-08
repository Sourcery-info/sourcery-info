// Import the function which initializes a new mutable store.
import { writable } from 'svelte/store';
import { subscribe, unsubscribe } from "@sourcery/ws/src/client";

// That's it;  state is now usable!  Components can subscribe
// to state changes, and we can mutate the store easily.
//
// Note that this is a singleton.
export const state = writable({
    files: []
});

// We also want to connect to websockets.  Svelte does
// server-side rendering _really well_ out of the box, so
// we will export a function that can be called by our root
// component after mounting to connnect
export const connect = () => {
    // subscribe("files", (data) => {
    //     state.update((s) => {
    //         return { ...s, files: data };
    //     });
    // });
}

export const disconnect = () => {
    // unsubscribe("files");
}