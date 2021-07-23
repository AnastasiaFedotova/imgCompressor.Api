import fs from "fs";
import util from "util";
import client from "../db/db";
import { addFileMetadata } from "./addMetadata";
const klbInMb = 1024;

export default async (fileName: string, data: Buffer): Promise<void> => {
  const hgetall = util.promisify(client.hgetall).bind(client);
  const set = util.promisify(client.set).bind(client);
  const lrange = util.promisify(client.lrange).bind(client);
  const get = util.promisify(client.get).bind(client);

  const limit = 0.06;
  const storagePath = "./dist/imgstorage/";
  let imagesSize = await get('globalImgsSize');
  const files: string[] = await lrange('imgsList', 0, -1);

  if (imagesSize > limit) {
    const metaDataFilesPromises = files.map(async (file) => {
      const fileData = await hgetall(file);

      return {
        path: storagePath + file,
        name: file,
        viewsCount: fileData.countViews,
        size: fileData.size
      }
    })

    const metaDataFiles = await Promise.all(metaDataFilesPromises);

    while (imagesSize > limit) {
      const minFileByView = metaDataFiles.reduce((accumulator, currentValue) => {
        return currentValue.viewsCount > accumulator.viewsCount ? accumulator : currentValue
      });

      await util.promisify(fs.unlink)(minFileByView.path);
      client.del(minFileByView.name);
      client.lrem('imgsList', 0, minFileByView.name);
      set('globalImgsSize', String(await get('globalImgsSize') - minFileByView.size));
      imagesSize -= minFileByView.size;
    }
  }

  fs.writeFile(storagePath + fileName, data, async (err) => {
    if (err) throw err;
    addFileMetadata(fileName, (data.length / klbInMb / klbInMb).toFixed(2));
  });
}
