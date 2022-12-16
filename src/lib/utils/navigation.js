import { info } from './helper';

export const getFragment = () => window.location.hash.slice(1);

/**
 * Configure url attributes for (from/to) search attributes and/or (from/to) pathnames.
 * Choose one from the two navigation lifecycle functions: afterNavigate or beforeNavigate.
 * The callback will receive the attribute hit during navigation
 *
 * @param {any} afterOrBeforeNavigate - Can be one of the two navigation lifecycle functions: afterNavigate or beforeNavigate
 * @param {{from_searches?: Array<[string, string]>, to_searches?: Array<[string, string]>, from_pathnames?: Array<string>, to_pathnames?: Array<string>}} config - Search and/or path attributes that should be detected
 * @param {any} callback - will receive the attribute if it was hit during navigation
 */
export const afterOrBeforeNavigation = (
  afterOrBeforeNavigate,
  { from_searches, to_searches, from_pathnames, to_pathnames } = {
    from_searches: [],
    to_searches: [],
    from_pathnames: [],
    to_pathnames: []
  },
  callback = () => void 0
) => {
  const FROM_SEARCH_KEY = 'from_searches';
  const TO_SEARCH_KEY = 'to_searches';
  const FROM_PATH_KEY = 'from_paths';
  const TO_PATH_KEY = 'to_paths';

  const omitter = new Map();
  omitter.set(
    FROM_SEARCH_KEY,
    /**
     * @param {import('@sveltejs/kit').NavigationTarget} from
     */
    (from) => {
      return from_searches?.find((needle) => {
        if (from.url.searchParams.has(needle[0])) {
          if (from.url.searchParams.get(needle[0]) === needle[1]) {
            return needle;
          }
        }
      });
    }
  );
  omitter.set(
    TO_SEARCH_KEY,
    /**
     * @param {import('@sveltejs/kit').NavigationTarget} to
     */
    (to) => {
      return to_searches?.find((needle) => {
        if (to.url.searchParams.has(needle[0])) {
          if (to.url.searchParams.get(needle[0]) === needle[1]) {
            return needle;
          }
        }
      });
    }
  );
  omitter.set(
    FROM_PATH_KEY,
    /**
     * @param {import('@sveltejs/kit').NavigationTarget} from
     */
    (from) => {
      return from_pathnames?.find((slug) => {
        if (from.url.pathname.startsWith(slug)) {
          return slug;
        }
      });
    }
  );
  omitter.set(
    TO_PATH_KEY,
    /**
     * @param {import('@sveltejs/kit').NavigationTarget} to
     */
    (to) => {
      return to_pathnames?.find((slug) => {
        if (to.url.pathname.startsWith(slug)) {
          return slug;
        }
      });
    }
  );

  afterOrBeforeNavigate(
    /**
     * @param {import('@sveltejs/kit').AfterNavigate} param0
     */
    ({ from, to }) => {
      let check = () => {
        /**
         * @type {string | any | unknown}
         */
        let ret = new Map([]);
        omitter.forEach((fn, key) => {
          let found;
          try {
            if (key === FROM_SEARCH_KEY && from && (found = fn(from))) {
              ret.set(key, found);
              // throw BreakExecption;
            }
            if (key === TO_SEARCH_KEY && to && (found = fn(to))) {
              ret.set(key, found);
              // throw BreakExecption;
            }
            if (key === FROM_PATH_KEY && from && (found = fn(from))) {
              ret.set(key, found);
              // throw BreakExecption;
            }
            if (key === TO_PATH_KEY && to && (found = fn(to))) {
              ret.set(key, found);
              // throw BreakExecption;
            }
          } catch (error) {}
        });
        return ret;
      };
      const res = check();
      if (typeof callback === 'function') callback(res, { from, to });
    }
  );
};
