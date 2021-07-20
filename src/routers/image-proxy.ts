import { Router } from "express";
import fs from "fs";
import mime from "mime-types";
import addMetadataViews from "../utils/addMetadataViews";
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
        if (file === `${imgName}.json`) {
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

        cacheImg(imgName, data);
        res.end(data);
      } else {
        fs.readFile(`${pathToSave}${imgName + '.json'}`, "utf8", (err, obj) => {
          if (err) throw new Error(err.message);

          const img = JSON.parse(obj.toString());
          addMetadataViews(`${pathToSave}${imgName + '.json'}`, img);

          console.log('saved picture');
          res.setHeader('content-type', `${mime.lookup(pathToSave + nameNewImg)}`);
          res.end(Buffer.from(img.data));
        })
      }
    });
  } catch(err) {
    res.statusCode = 404;
    res.json('not found');
  }
});

export default imageProxyApi;
