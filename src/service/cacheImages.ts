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
  memoryLimit = 0.05;
  oneDayInMl = 86400000;
  limitTimeInDays = this.oneDayInMl * 3;
  constructor(protected fileName: string, protected data: Buffer) {}

  async checkLimit(): Promise<boolean> {
    const imagesSize = +(await get('globalImagesSize'));
    return imagesSize > this.memoryLimit ? true : false;
  }

  async removeImage(name: string): Promise<void> {
    const size = await get(`size_${name}`);
    set('globalImagesSize', String(await get('globalImagesSize') - size));

    await unlink(storagePath + name);

    zrem('allImagesList', name);
    client.del(`size_${name}`);
  }

  async removeUnpopularImages(): Promise<void> {
    const allImages = await zrange('allImagesList', 0, -1);
    const actualImages = await zrange('actualImagesList', 0, -1);

    for (let i = 0; i < allImages.length; i++) {
      if (!actualImages.includes(allImages[i])) {
        await this.removeImage(allImages[i]);

        if (!await this.checkLimit()) {
          return;
        }
      }
    }

    for (let i = 0; i < actualImages.length; i++) {
      await zrem('actualImagesList', actualImages[i]);
      await this.removeImage(actualImages[i]);

      if (!await this.checkLimit()) {
        return;
      }
    }
  }

  async saveImages(): Promise<void> {
    if (await this.checkLimit()) {
      await this.removeUnpopularImages();
    }

    fs.writeFile(storagePath + this.fileName, this.data, async (err) => {
      if (err) throw err;
      addFileMetadata(this.fileName, (this.data.length / klbInMb / klbInMb).toFixed(2));
    });
  }
}
