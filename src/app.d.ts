/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
  interface Locals {
    session: import('svelte-kit-cookie-session').Session<SessionType>;
    repos: Map<string, any>,
    settingsRepo: import('$lib/types').Repo,
    usersRepo: import('$lib/types').Repo,
    videosRepo: import('$lib/types').Repo,
    imagesRepo: import('$lib/types').Repo,
    videosAllRepo: import('$lib/types').Repo,
  }
	// interface Platform {}
	// interface Session {}
}
