import slugify from '@sindresorhus/slugify';

export const SLUG_PRESERVE_UNICODE = false;
export const SLUG_SEPARATOR = '_';

export const urlsafeSlugProcessor = (string: string, opts?: any) => {
  const { separator = SLUG_SEPARATOR } = opts || {};

  return slugify(string, {
    customReplacements: [
      // runs before any other transformations
      ['$', 'DOLLAR'], // `$destroy` & co
      ['-', 'DASH'] // conflicts with `separator`
    ],
    separator,
    decamelize: false,
    lowercase: false
  })
    .replace(/DOLLAR/g, '$')
    .replace(/DASH/g, '-');
};

/* unicode-preserver processor */

const alphaNumRegex = /[a-zA-Z0-9]/;
const unicodeRegex = /\p{Letter}/u;
const isNonAlphaNumUnicode = (string: string) =>
  !alphaNumRegex.test(string) && unicodeRegex.test(string);

export const unicodeSafeProcessor = (string: string, opts: any) => {
  const { separator = SLUG_SEPARATOR } = opts || {};

  return string
    .split('')
    .reduce(
      (
        accum: { current: { type: any; string: any }; chunks: any[] },
        char: any,
        index: number,
        array: string | any[]
      ) => {
        const type = isNonAlphaNumUnicode(char) ? 'pass' : 'process';

        if (index === 0) {
          accum.current = { type, string: char };
        } else if (type === accum.current.type) {
          accum.current.string += char;
        } else {
          accum.chunks.push(accum.current);
          accum.current = { type, string: char };
        }

        if (index === array.length - 1) {
          accum.chunks.push(accum.current);
        }

        return accum;
      },
      { chunks: [], current: { type: '', string: '' } }
    )
    .chunks.reduce((accum: any[], chunk: { type: string; string: any }) => {
      const processed =
        chunk.type === 'process' ? urlsafeSlugProcessor(chunk.string) : chunk.string;

      processed.length > 0 && accum.push(processed);

      return accum;
    }, [])
    .join(separator);
};

/* session processor */

export const make_session_slug_processor = ({
  preserve_unicode = SLUG_PRESERVE_UNICODE,
  separator = SLUG_SEPARATOR
}) => {
  const processor = preserve_unicode ? unicodeSafeProcessor : urlsafeSlugProcessor;
  const seen = new Set();

  return (string: any) => {
    const slug = processor(string, { separator });

    if (seen.has(slug)) throw new Error(`Duplicate slug ${slug}`);
    seen.add(slug);

    return slug;
  };
};
