import { Router } from "express";
import fs from "fs";
import sharp from "sharp";
import identifyFormat from "../utils/identifyFormat";

const imageProxyApi = Router();

imageProxyApi.get("/images/:imgname/params", async (req, res) => {
  const { width = 0, height = 0, format } = req.query;
  const imgname = req.params.imgname;
  const ua = req.headers['user-agent'];

  try {
    fs.readFile(`./dist/uploads/${imgname}`, async (err, image) => {
      if (err) throw new Error(err.message);

      let data: Buffer;
      if (width && !height) data = await sharp(image).resize({ width: +width }).toBuffer();
      else if (!width && height) data = await sharp(image).resize({ height: +height }).toBuffer();
      else if (!width && !height) data = image;
      else data = await sharp(image)
        .resize({
          width: +width,
          height: +height,
          fit: sharp.fit.cover
        }).toBuffer();

      if (format) res.setHeader('content-type', `image/${format}`);
      else res.setHeader('content-type', `image/${identifyFormat(ua)}`);

      res.end(data);
    });
  } catch(err) {
    res.statusCode = 404;
    res.json('not found');
  }
});

export default imageProxyApi;
