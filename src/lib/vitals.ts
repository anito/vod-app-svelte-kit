import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';
import { emit } from './utils';

type Options = {
  params: Record<string, string>;
  analyticsId: string;
  path: string;
  debug?: boolean;
};

type Body = {
  dsn: string;
  id: string;
  page: string;
  href: string;
  event_name: string;
  value: string;
  speed: string;
};

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  let navigatorConn: { effectiveType: string };
  return 'connection' in navigator &&
    (navigatorConn = navigator.connection as { effectiveType: string }) &&
    navigatorConn.effectiveType
    ? navigatorConn['effectiveType']
    : '';
}

async function sendToAnalytics(metric: Metric, options: Options) {
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
    speed: getConnectionSpeed() as unknown as string
  };

  if (options.debug) {
    console.log('[Web Vitals]', metric.name, JSON.stringify(body, null, 2));
  }

  const blob = new Blob([new URLSearchParams(body).toString()], {
    // This content type is necessary for `sendBeacon`
    type: 'application/x-www-form-urlencoded'
  });

  emit('vercel:web-vital', { body, metric });

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

export function webVitals(options: Options) {
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
