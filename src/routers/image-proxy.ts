import { Router } from "express";
import fs from "fs";
import sharp from "sharp";

const imageProxyApi = Router();

imageProxyApi.get("/images/:imgname/params", async (req, res) => {
  const { width, height, _format } = req.query;
  const imgname = req.params.imgname;


  fs.readFile(`./dist/uploads/${imgname}`, async (err, image) => {
    if (err) {
      res.statusCode = 404;
      res.json('not found');
    } else {
      await sharp(image).extract({ width: +width, height: +height, left: 0, top: 0 }).toBuffer().then(data => {
        res.end(data)
      })
    }
  });


});

export default imageProxyApi;
