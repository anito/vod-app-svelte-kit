import type { AfterNavigate, BeforeNavigate, NavigationTarget } from '@sveltejs/kit';

export const getFragment = () => window.location.hash.slice(1);

/**
 * @param lifecycleFunction
 * @param excludes - 
 * Configure url attributes for (from/to) search attributes and/or (from/to) pathnames.
 * Choose one from the two navigation lifecycle functions: afterNavigate or beforeNavigate.
 * @param callback - will be executed if none of the exclude conditions are met
 */
export const afterOrBeforeNavigation = (
  afterOrBeforeNavigate: {
    (callback: (navigation: AfterNavigate | BeforeNavigate) => void): void;
    (
      arg0: ({ from, to }: { from: NavigationTarget | null; to: NavigationTarget | null }) => void
    ): void;
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
    arg0: { from: NavigationTarget | null; to: NavigationTarget | null },
    arg1: Map<unknown, unknown>
  ) => void
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
    let checkExcludes = () => {
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
    const excludes = checkExcludes();
    if (!checkExcludes().size) navigationCallback(callback, { from, to }, excludes);
  });
};

const navigationCallback = async (
  callback: (
    arg0: { from: NavigationTarget | null; to: NavigationTarget | null },
    arg1: Map<unknown, unknown>
  ) => void = () => void 0,
  navigation: { from: NavigationTarget | null; to: NavigationTarget | null },
  excludes: Map<unknown, unknown>
) => {
  callback(navigation, excludes);
};
