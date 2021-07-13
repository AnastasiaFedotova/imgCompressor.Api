import { Router } from "express";
import imagesApi from './images';
import imageProxyApi from './image-proxy';

const api = Router();

api.use("/images", imagesApi);
api.use("/image-proxy", imageProxyApi);

export default api;
