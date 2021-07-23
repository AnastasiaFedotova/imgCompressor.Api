import { Router } from "express";
import fs from "fs";
import mime from "mime-types";
import cacheImg from "../utils/cacheImages";
import identifyFormat from "../utils/identifyFormat";
import resizePicture from "./../utils/resizePicture";

const imageProxyApi = Router();

imageProxyApi.get("/images/:imgname/params", async (req, res) => {
  const ua = req.useragent;
  const { width = 0, height = 0, format = identifyFormat(ua) } = req.query;
  const imgFullName = req.params.imgname;
  const imgName = imgFullName.split('.')[0];

  try {
    fs.readFile(`./dist/uploads/${imgFullName}`, async (err, image) => {
      if (err) throw new Error(err.message);
      const pathToSave = `./dist/imgstorage/`;
      const nameNewImg = imgName + '.' + format;
      let data: Buffer;
      let isSavedPicture = false;

      fs.readdirSync('dist/imgstorage').forEach(file => {
        if (file === `${imgName}.${format}`) {
          isSavedPicture = true;
        }
      });

      if (!isSavedPicture) {
        const resizedImg = resizePicture(image, +width, +height);

        if (format) {
          if (format === 'avif') data = await resizedImg.avif({}).toBuffer();
          if (format === 'webp') data = await resizedImg.webp({}).toBuffer();

          res.setHeader('content-type', `image/${format}`);
        } else {
          data =  await resizedImg.toBuffer();
          res.setHeader('content-type', `${mime.lookup(`./dist/uploads/${imgFullName}`)}`);
        }

        cacheImg(`${imgName}.${format}`, data);

        res.end(data);
      } else {
        fs.readFile(`./dist/imgstorage/${imgName}.${format}`, async (err, img) => {
          if (err) throw new Error(err.message);

          res.setHeader('content-type', `${mime.lookup(pathToSave + nameNewImg)}`);
          res.end(img);
        })
      }
    });
  } catch(err) {
    res.statusCode = 404;
    res.json('not found');
  }
});

export default imageProxyApi;
