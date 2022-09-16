/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
  interface Locals {
    session: import('svelte-kit-cookie-session').Session<SessionData>;
    usersRepo: import('$lib/repos').UsersRepo,
    videosRepo: import('$lib/repos').VideosRepo,
    imagesRepo: import('$lib/repos').ImagesRepo,
    videosAllRepo: import('$lib/repos').VideosAllRepo,
  }
	// interface Platform {}
	// interface Session {}
	// interface Stuff {}
}
