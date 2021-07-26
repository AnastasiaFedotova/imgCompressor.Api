import { Details } from "express-useragent";
import formatsData from "./formatsData";

export default function (userAgent: Details):string {
  const browserName = userAgent.browser;
  const [browserMajor, browserMinor] = userAgent.version.split('.');

  let format: string = null;

  formatsData.forEach(elem => {
    elem.data.find(item => {
      if (browserName === item.browser) {
        if (item.os && item.os !== userAgent.os) {
          return false;
        }

        if (item.version.minor && !(+browserMinor >= item.version.minor)) {
          return false;
        }

        if (+browserMajor >= item.version.major) {
          format = elem.name;
          return true;
        }
      }

      return false;
    })
  });

  return format;
}
