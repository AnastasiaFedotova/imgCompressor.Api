import { Router } from "express";
import { ImageEditor } from "../service/imageEditor";

const imageProxyApi = Router();

imageProxyApi.get("/images/:imgname/params", async (req, res) => {
  const ua = req.useragent;
  const { width = 0, height = 0, format = null } = req.query;
  const imgFullName = req.params.imgname;

  try {
    const userFormat = typeof format === 'string' ? format : null;
    const data = await (new ImageEditor(imgFullName, +width, +height, ua, userFormat)).getEditedImage();

    res.setHeader('content-type', data.type);
    res.end(data.value);
  } catch(err) {
    console.log(err);
    res.json('err');
  }
});

export default imageProxyApi;
