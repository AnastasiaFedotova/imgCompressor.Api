import fs from "fs";
import util from "util";
import client from "../db/db";
import { addFileMetadata } from "../utils/addMetadata";
const set = util.promisify(client.set).bind(client);
const zrem = util.promisify(client.zrem).bind(client);
const zrangebyscore = util.promisify(client.zrangebyscore).bind(client);
const get = util.promisify(client.get).bind(client);
const rpush = util.promisify(client.rpush).bind(client);
const sort = util.promisify(client.sort).bind(client);
//const hgetall = util.promisify(client.hgetall).bind(client);
const unlink = util.promisify(fs.unlink);

const klbInMb = 1024;
const storagePath = "./dist/imgstorage/";

export class CacheImages {
  memoryLimit = 0.05;
  oneDayInMl = 86400000;
  limitTimeInDays = this.oneDayInMl * 3;
  constructor(protected fileName: string, protected data: Buffer) {}

  async checkLimit(): Promise<boolean> {
    const imagesSize = +(await get('globalImagesSize'));
    return imagesSize > this.memoryLimit ? true : false;
  }

  async removeUnpopularImages(): Promise<void> {
    const date = new Date().getTime();
    //let limit = date - this.limitTimeInDays;
    if (await this.checkLimit()) {
      const minFileByDate = await zrangebyscore('imagesList', 0, date);
      await rpush('sortedImagesListByDate', minFileByDate);

      const minFilesByViews = await sort('sortedImagesListByDate', 'BY', 'countView_*');

      for (let i = 0; i < minFilesByViews.length; i++) {
        if (await this.checkLimit()) {
          console.log(minFilesByViews[i]);
          const size = await get(`size_${minFilesByViews[i]}`);
          set('globalImagesSize', String(await get('globalImagesSize') - size));

          await unlink(storagePath + minFilesByViews[i]);

          zrem('imagesList', minFilesByViews[i]);
          client.del(`size_${minFilesByViews[i]}`);
          client.del(`countView_${minFilesByViews[i]}`);
        } else {
          client.del('sortedImagesListByDate');
          break;
        }
      }
    }
  }

  async saveImages(): Promise<void> {
    await this.removeUnpopularImages();
    fs.writeFile(storagePath + this.fileName, this.data, async (err) => {
      if (err) throw err;
      addFileMetadata(this.fileName, (this.data.length / klbInMb / klbInMb).toFixed(2));
    });
  }
}
