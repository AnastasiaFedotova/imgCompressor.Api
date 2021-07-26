import fs from "fs";
import util from "util";
import client from "../db/db";
import { addFileMetadata } from "../utils/addMetadata";
const set = util.promisify(client.set).bind(client);
const zrem = util.promisify(client.zrem).bind(client);
const zrange = util.promisify(client.zrange).bind(client);
const get = util.promisify(client.get).bind(client);
const unlink = util.promisify(fs.unlink);
const klbInMb = 1024;
const storagePath = "./dist/imgstorage/";

export class CacheImages {
  imagesSize: number;
  limit = 0.05;
  constructor(protected fileName: string, protected data: Buffer) {}

  async checkLimit(): Promise<boolean> {
    this.imagesSize = +(await get('globalImagesSize'));

    if (this.imagesSize > this.limit) {
      return true;
    } else {
      return false;
    }
  }

  async removeUnpopularImages(): Promise<void> {
    if (await this.checkLimit()) {
      while (this.imagesSize > this.limit) {
        const [ minFileByView ] = await zrange('imagesList', 0, 0);
        const size = await get(minFileByView);

        zrem('imagesList', minFileByView);
        client.del(minFileByView);
        await unlink(storagePath + minFileByView);

        set('globalImagesSize', String(await get('globalImagesSize') - size));
        this.imagesSize -= size;
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
