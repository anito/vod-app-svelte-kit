import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  return 'connection' in navigator &&
    navigator['connection'] &&
    // @ts-ignore
    'effectiveType' in navigator['connection']
    ? // @ts-ignore
      navigator['connection']['effectiveType']
    : '';
}

/**
 * @param {import("web-vitals").Metric} metric
 * @param {{ params: { [s: string]: any; } | ArrayLike<any>; path: string; analyticsId: string; debug: boolean; }} options
 */
async function sendToAnalytics(metric, options) {
  const page = Object.entries(options.params).reduce(
    (acc, [key, value]) => acc.replace(value, `[${key}]`),
    options.path
  );

  const body = {
    dsn: options.analyticsId,
    id: metric.id,
    page,
    href: location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed()
  };

  if (options.debug) {
    console.log('[Web Vitals]', metric.name, JSON.stringify(body, null, 2));
  }

  // @ts-ignore
  const blob = new Blob([new URLSearchParams(body).toString()], {
    // This content type is necessary for `sendBeacon`
    type: 'application/x-www-form-urlencoded'
  });

  console.log('Options:', options);
  console.log('Blob:', blob);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else
    await fetch(vitalsUrl, {
      body: blob,
      method: 'POST',
      credentials: 'omit',
      keepalive: true
    }).then((res) => {
      console.log(res);
    });
}

/**
 * @param {any} options
 */
export function webVitals(options) {
  try {
    onFID((metric) => sendToAnalytics(metric, options));
    onTTFB((metric) => sendToAnalytics(metric, options));
    onLCP((metric) => sendToAnalytics(metric, options));
    onCLS((metric) => sendToAnalytics(metric, options));
    onFCP((metric) => sendToAnalytics(metric, options));
  } catch (err) {
    console.error('[Web Vitals]', err);
  }
}
