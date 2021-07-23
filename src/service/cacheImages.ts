import fs from "fs";
import util from "util";
import { MetaDataImages } from "../classes/metaDataImages";
import client from "../db/db";
import { addFileMetadata } from "../utils/addMetadata";

const hgetall = util.promisify(client.hgetall).bind(client);
const set = util.promisify(client.set).bind(client);
const lrange = util.promisify(client.lrange).bind(client);
const get = util.promisify(client.get).bind(client);

const klbInMb = 1024;
const storagePath = "./dist/imgstorage/";

export class CacheImages {
  imagesSize: number;
  limit = 0.06;
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
    const files = await lrange('imagesList', 0, -1);

    if (await this.checkLimit()) {
      const metaDataFilesPromises: Promise<MetaDataImages>[] = files.map(async (file) => {
        const fileData = await hgetall(file);

        return {
          path: storagePath + file,
          name: file,
          viewsCount: fileData.countViews,
          size: fileData.size
        }
      })

      const metaDataFiles = await Promise.all(metaDataFilesPromises);

      while (this.imagesSize > this.limit) {
        const minFileByView = metaDataFiles.reduce((accumulator, currentValue) => {
          return currentValue.viewsCount > accumulator.viewsCount ? accumulator : currentValue
        });

        await util.promisify(fs.unlink)(minFileByView.path);
        client.del(minFileByView.name);
        client.lrem('imagesList', 0, minFileByView.name);
        set('globalImagesSize', String(await get('globalImagesSize') - minFileByView.size));

        const remFileIndex = metaDataFiles.findIndex(e => e.name === minFileByView.name);
        metaDataFiles.splice(remFileIndex, 1);
        this.imagesSize -= minFileByView.size;
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
