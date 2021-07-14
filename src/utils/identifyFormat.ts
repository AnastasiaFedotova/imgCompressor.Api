export default function (userAgent: string):string {
  let format: string = null;

  if (/chrome/i.test(userAgent)) format = 'avif';
  else if (!/safari/i.test(userAgent) && !/ie/i.test(userAgent)) format = 'webp';
  else format = 'jpeg';

  return format;
}
