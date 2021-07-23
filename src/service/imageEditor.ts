import { Details } from "express-useragent";
import fs from "fs";
import mime from "mime-types";
import util from "util";
import cacheImg from "../utils/cacheImages";
import identifyFormat from "../utils/identifyFormat";
import resizePicture from "../utils/resizePicture";

const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const pathToSave = `./dist/imgstorage/`;

export class ImageEditor {
  imgName: string;
  nameNewImg: string;
  data: Buffer;
  constructor(protected imgFullName: string, protected width: number,
    protected height: number, ua: Details, protected format: string) {
    if (format === null) format = identifyFormat(ua);
    this.imgName = imgFullName.split('.')[0];
    this.nameNewImg = this.imgName + '.' + format;
  }

  async isExistFile(): Promise<boolean> {
    let isSavedPicture = false;

    (await readdir('dist/imgstorage')).forEach(file => {
      if (file === this.nameNewImg) {
        isSavedPicture = true;
      }
    });

    return isSavedPicture ? true : false;
  }

  async editImage(): Promise<{ value: Buffer; type: string; }>  {
    const res = {
      value: null,
      type: null
    }
    const image = await readFile(`./dist/uploads/${this.imgFullName}`);
    const resizedImg = resizePicture(image, +this.width, +this.height);

    if (this.format) {
      if (this.format === 'avif') this.data = await resizedImg.avif({}).toBuffer();
      if (this.format === 'webp') this.data = await resizedImg.webp({}).toBuffer();

      res.type = `image/${this.format}`;
    } else {
      this.data = await resizedImg.toBuffer();

      res.type = `${mime.lookup(`./dist/uploads/${this.imgFullName}`)}`;
    }

    cacheImg(this.nameNewImg, this.data);

    res.value = this.data;

    return res;
  }

  async getEditedImage(): Promise<{ value: Buffer; type: string; }> {
    let res = null;

    if (await this.isExistFile()) {
      const img = await readFile(`./dist/imgstorage/${this.nameNewImg}`);

      res = {
        type:`${mime.lookup(pathToSave + this.nameNewImg)}`,
        value: img
      }
    } else {
      res = this.editImage();
    }
    return res;
  }
}
