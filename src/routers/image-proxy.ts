import { Router } from "express";
import fs from "fs";
import sharp, { Sharp } from "sharp";
import mime from 'mime-types';
import identifyFormat from "../utils/identifyFormat";

const imageProxyApi = Router();

imageProxyApi.get("/images/:imgname/params", async (req, res) => {
  const ua = req.headers['user-agent'];
  const { width = 0, height = 0, format = identifyFormat(ua) } = req.query;
  const imgname = req.params.imgname;

  console.log(mime.lookup(`./dist/uploads/${imgname}`))
  try {
    fs.readFile(`./dist/uploads/${imgname}`, async (err, image) => {
      if (err) throw new Error(err.message);

      let data: Buffer;
      let img : Sharp;
      if (width && !height) img = sharp(image, {failOnError: false}).resize({ width: +width });
      else if (!width && height) img = sharp(image, {failOnError: false}).resize({ height: +height });
      else if (!width && !height) img = sharp(image, {failOnError: false});
      else img = sharp(image)
        .resize({
          width: +width,
          height: +height,
          fit: sharp.fit.cover
        });

      if (format) {
        if (format === 'avif') data = await img.avif({}).toBuffer()
        if (format === 'webp') data = await img.webp({}).toBuffer();

        res.setHeader('content-type', `image/${format}`);
      } else {
        data =  await img.toBuffer();
        res.setHeader('content-type', `${mime.lookup(`./dist/uploads/${imgname}`)}`);
      }

      res.end(data);
    });
  } catch(err) {
    res.statusCode = 404;
    res.json('not found');
  }
});

export default imageProxyApi;
