import UAParser from "ua-parser-js";

export default function (userAgent: string):string {
  const browser = new UAParser(userAgent).getBrowser();
  const browserVersion = +browser.version.split('.')[0];
  const browserName = browser.name;

  let format: string = null;

  if (browserName === 'Chrome') {
    format = browserVersion > 85 ? 'avif' : browserVersion > 32 ? 'webp' : null;
  } else if (browserName === 'Opera') {
    format = browserVersion > 71 ? 'avif' : browserVersion > 18 ? 'webp' : null;
  } else if (browserName === 'Firefox') {
    format = browserVersion > 64 ? 'webp' : null;
  } else if (browserName === 'Edge') {
    format = browserVersion > 17 ? 'webp' : null;
  } else format = null;

  return format;
}
