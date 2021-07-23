import { Router } from "express";
import { checkFileAndWrite } from "../service/image-proxy-service";
import identifyFormat from "../utils/identifyFormat";

const imageProxyApi = Router();

imageProxyApi.get("/images/:imgname/params", async (req, res) => {
  const ua = req.useragent;
  const { width = 0, height = 0, format = identifyFormat(ua) } = req.query;
  const imgFullName = req.params.imgname;

  try {
    const data = await checkFileAndWrite(imgFullName, +width, +height, String(format));

    res.setHeader('content-type', data.type);
    res.end(data.value);
  } catch(err) {
    res.statusCode = 404;
    res.json('not found');
  }
});

export default imageProxyApi;
