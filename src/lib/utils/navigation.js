export const getFragment = () => window.location.hash.slice(1);

/**
 *
 * @param {any} lifecyleFn - afterNavigate (or beforeNavigate) method must be passed here
 * @param {any} callback
 * @param {{searches: Array<[string, string]>, from_pathnames: Array<string>, to_pathnames: Array<string>}} param0
 */
export const afterNavigation = (
  lifecyleFn,
  callback,
  { searches, from_pathnames, to_pathnames } = {
    searches: [],
    from_pathnames: [],
    to_pathnames: []
  }
) => {
  const SEARCHES_KEY = 'searches';
  const FROM_PATHS_KEY = 'from_paths';
  const TO_PATHS_KEY = 'to_paths';

  // @ts-ignore
  const omitter = new Map([
    [
      /** @type {string} */
      SEARCHES_KEY,
      /**
       * @param {import('@sveltejs/kit').NavigationTarget} target
       */
      (target) => {
        return searches.filter((needle, i) => {
          if (target.url.searchParams.has(needle[0])) {
            if (target.url.searchParams.get(needle[0]) === needle[1]) {
              return needle;
            }
          }
        });
      }
    ],
    [
      FROM_PATHS_KEY,
      (from) => {
        return from_pathnames.filter((slug) => {
          if (from.url.pathname.indexOf(slug) !== -1) {
            console.log('FROM_PATHS', slug);
            return slug;
          }
        });
      }
    ],
    [
      TO_PATHS_KEY,
      (to) => {
        return to_pathnames.filter((slug) => {
          if (to.url.pathname.indexOf(slug) !== -1) {
            console.log('TO_PATHS', slug);
            return slug;
          }
        });
      }
    ]
  ]);

  lifecyleFn(
    /**
     * @param {{from: import('@sveltejs/kit').NavigationTarget, to: import('@sveltejs/kit').NavigationTarget}} param0
     */
    ({ from, to }) => {
      /**
       *
       * @returns {any}
       */
      let check = () => {
        /**
         * @type {string | any[] | unknown}
         */
        let ret = false;
        omitter.forEach((fn, key) => {
          /**
           * @type {string | any[]}
           */
          let f;
          try {
            if (key === SEARCHES_KEY && to && (f = fn(to)) && f.length) throw f[0];
            if (key === TO_PATHS_KEY && to && (f = fn(to)) && f.length) throw f[0];
            if (key === FROM_PATHS_KEY && from && (f = fn(from)) && f.length) throw f[0];
          } catch (err) {
            ret = err;
          }
        });
        return ret;
      };
      const res = check();
      if (typeof callback === 'function') callback(res);
    }
  );
};
