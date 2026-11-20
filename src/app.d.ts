// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
    interface PageState {
        /** Set while cook mode is open (shallow history entry `#cook`), so Back closes it. */
        cook?: boolean;
    }
}
