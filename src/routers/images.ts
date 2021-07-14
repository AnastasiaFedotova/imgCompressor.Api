import { Router } from "express";
import fs from 'fs';
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
      res.setHeader('content-type', `image/${identifyFormat(ua)}`);
      res.end(image);
    }
  });
   /*const readableStream = fs.createReadStream(`./dist/uploads/${imgname}`);
  res.setHeader("Content-Type", "image/jpeg");
  readableStream.on("data", function(){
    readableStream.pipe(res);
  });


  res.end();*/
});

export default imagesApi;
