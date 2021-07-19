import formatsData from "./formatsData";
export default function (userAgent):string {
  const browserName = userAgent.browser;
  const browserMajor = userAgent.version.split('.')[0];
  const browserMinor = userAgent.version.split('.')[1];

  let format: string = null;

  formatsData.forEach(elem => {
    elem.data.find(item => {
      if (browserName === item.browser) {
        if (item.os && item.os !== userAgent.os) {
          return false;
        }

        if (item.version.minor && !(item.version.minor >= browserMinor)) {
          return false;
        }

        if (browserMajor >= item.version.major) {
          format = elem.name;
          return true;
        }
      }

      return false;
    })
  });

  return format;
}
