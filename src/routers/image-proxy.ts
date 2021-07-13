import { Router } from "express";

const imageProxyApi = Router();

imageProxyApi.get("/", async (_req, _res) => {
  console.log('image proxy')
});

export default imageProxyApi;
