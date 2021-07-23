import fs from "fs";
import mime from "mime-types";
import util from "util";
import cacheImg from "../utils/cacheImages";
import resizePicture from "./../utils/resizePicture";

export async function checkFileAndWrite(imgFullName: string, width: number, height: number, format: string): Promise<{value: Buffer, type: string}> {
  const readFile = util.promisify(fs.readFile);
  const readdir = util.promisify(fs.readdir);

  const imgName = imgFullName.split('.')[0];
  const pathToSave = `./dist/imgstorage/`;
  const nameNewImg = imgName + '.' + format;
  const res = {
    value: null,
    type: null
  }
  let data: Buffer;
  let isSavedPicture = false;

  const image = await readFile(`./dist/uploads/${imgFullName}`);

  (await readdir('dist/imgstorage')).forEach(file => {
    if (file === `${imgName}.${format}`) {
      isSavedPicture = true;
    }
  });

  if (!isSavedPicture) {
    const resizedImg = resizePicture(image, +width, +height);

    if (format) {
      if (format === 'avif') data = await resizedImg.avif({}).toBuffer();
      if (format === 'webp') data = await resizedImg.webp({}).toBuffer();

      res.type = `image/${format}`;
    } else {
      data = await resizedImg.toBuffer();

      res.type = `${mime.lookup(`./dist/uploads/${imgFullName}`)}`;
    }

    cacheImg(`${imgName}.${format}`, data);

    res.value = data;
  } else {
    const img = await readFile(`./dist/imgstorage/${imgName}.${format}`);
    res.type = `${mime.lookup(pathToSave + nameNewImg)}`;
    res.value = img;
  }

  return res;
}

