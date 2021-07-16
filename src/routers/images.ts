import { Router } from "express";
import fs from 'fs';
import mime from "mime";
import identifyFormat from "../utils/identifyFormat";
import upload from './../storage/storagesetting';

const imagesApi = Router();

imagesApi.post("/", upload, (req , res) => {
  console.log(req.file);
  res.status(200).send({uploaded: true});
});

imagesApi.get("/:imgname", upload, (req , res) => {
  const imgname = req.params.imgname;
  const ua = req.headers['user-agent'];

  fs.readFile(`./dist/uploads/${imgname}`, (err, image) => {
    if (err) {
      res.statusCode = 404;
      res.json('not found');
    } else {
      res.statusCode = 200;

      if (identifyFormat(ua)) res.setHeader('content-type', `image/${identifyFormat(ua)}`);
      else res.setHeader('content-type', mime.lookup(`./dist/uploads/${imgname}`));

      res.end(image);
    }
  });
});

export default imagesApi;
