import sharp, { Sharp } from "sharp";

export default function (image: Buffer, width: number, height: number): Sharp {
  let resizedImg: Sharp;
  const sharpInstance = sharp(image, {failOnError: false});

  try {
    if (width && !height) {
    resizedImg = sharpInstance.resize({ width: +width });
    } else if (!width && height) {
      resizedImg = sharpInstance.resize({ height: +height });
    } else if (!width && !height) {
      resizedImg = sharpInstance;
    } else {
      resizedImg = sharpInstance
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
