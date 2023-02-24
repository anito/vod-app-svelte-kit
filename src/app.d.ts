/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
  interface Locals {
    config: import('$lib/types').Config;
    session: import('svelte-kit-cookie-session').Session<SessionType>;
    usersRepo: import('$lib/classes/repos/types').Repo;
    videosRepo: import('$lib/classes/repos/types').Repo;
    imagesRepo: import('$lib/classes/repos/types').Repo;
    videosAllRepo: import('$lib/classes/repos/types').Repo;
    userAgent: any;
    pagination: {
      users: import('$lib/classes/repos/types').Pagination;
      videos: import('$lib/classes/repos/types').Pagination;
      videosAll: import('$lib/classes/repos/types').Pagination;
      images: import('$lib/classes/repos/types').Pagination;
    };
  }
  // interface Platform {}
  // interface Session {}
}
