import sharp, { Sharp } from "sharp";

export default function (image: Buffer, width: number, height: number): Sharp {
  let resizedImg: Sharp;

  try {
    if (width && !height) {
    resizedImg = sharp(image, {failOnError: false}).resize({ width: +width });
    } else if (!width && height) {
      resizedImg = sharp(image, {failOnError: false}).resize({ height: +height });
    } else if (!width && !height) {
      resizedImg = sharp(image, {failOnError: false});
    } else {
      resizedImg = sharp(image, {failOnError: false})
      .resize({
        width: +width,
        height: +height,
        fit: sharp.fit.cover
      });
    }
  } catch (err) {
    throw new Error(err.message)
  }

  return resizedImg;
}
