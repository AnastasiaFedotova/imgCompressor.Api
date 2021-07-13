import { Router } from "express";
import upload from './../storage/storagesetting';
const imagesApi = Router();

imagesApi.post("/", upload, (req , res) => {
  console.log(req.file);
  res.status(200).send({uploaded: true});
});

export default imagesApi;
