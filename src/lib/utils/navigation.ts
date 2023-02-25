import type { AfterNavigate, BeforeNavigate, NavigationTarget } from '@sveltejs/kit';

export const getFragment = () => window.location.hash.slice(1);

/**
 * Configure url attributes for (from/to) search attributes and/or (from/to) pathnames.
 * Choose one from the two navigation lifecycle functions: afterNavigate or beforeNavigate.
 * The callback will receive the attribute hit during navigation
 */
export const afterOrBeforeNavigation = (
  afterOrBeforeNavigate: {
    (callback: (navigation: AfterNavigate | BeforeNavigate) => void): void;
    (arg0: ({ from, to }: { from: any; to: any }) => void): void;
  },
  {
    from_searches,
    to_searches,
    from_pathnames,
    to_pathnames
  }: {
    from_searches?: string[];
    to_searches?: string[];
    from_pathnames?: string[];
    to_pathnames?: string[];
  } = {
    from_searches: [],
    to_searches: [],
    from_pathnames: [],
    to_pathnames: []
  },
  callback: (
    res: any,
    targets: { from: NavigationTarget | null; to: NavigationTarget | null }
  ) => void = () => {}
) => {
  const FROM_SEARCH_KEY = 'from_searches';
  const TO_SEARCH_KEY = 'to_searches';
  const FROM_PATH_KEY = 'from_paths';
  const TO_PATH_KEY = 'to_paths';

  const omitter = new Map();
  omitter.set(FROM_SEARCH_KEY, (from: NavigationTarget) => {
    return from_searches?.find((needle) => {
      if (from.url.searchParams.has(needle[0])) {
        if (from.url.searchParams.get(needle[0]) === needle[1]) {
          return needle;
        }
      }
    });
  });
  omitter.set(TO_SEARCH_KEY, (to: NavigationTarget) => {
    return to_searches?.find((needle) => {
      if (to.url.searchParams.has(needle[0])) {
        if (to.url.searchParams.get(needle[0]) === needle[1]) {
          return needle;
        }
      }
    });
  });
  omitter.set(FROM_PATH_KEY, (from: NavigationTarget) => {
    return from_pathnames?.find((slug) => {
      if (from.url.pathname.startsWith(slug)) {
        return slug;
      }
    });
  });
  omitter.set(TO_PATH_KEY, (to: NavigationTarget) => {
    return to_pathnames?.find((slug) => {
      if (to.url.pathname.startsWith(slug)) {
        return slug;
      }
    });
  });

  afterOrBeforeNavigate(({ from, to }) => {
    let check = () => {
      let ret = new Map([]);
      omitter.forEach((fn, key) => {
        let found;
        try {
          if (key === FROM_SEARCH_KEY && from && (found = fn(from))) {
            ret.set(key, found);
          }
          if (key === TO_SEARCH_KEY && to && (found = fn(to))) {
            ret.set(key, found);
          }
          if (key === FROM_PATH_KEY && from && (found = fn(from))) {
            ret.set(key, found);
          }
          if (key === TO_PATH_KEY && to && (found = fn(to))) {
            ret.set(key, found);
          }
        } catch (error) {}
      });
      return ret;
    };
    const res = check();
    if (typeof callback === 'function') callback(res, { from, to });
  });
};
