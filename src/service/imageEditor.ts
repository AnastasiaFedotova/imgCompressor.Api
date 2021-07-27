import { Details } from "express-useragent";
import fs from "fs";
import mime from "mime-types";
import util from "util";
import sharp, { Sharp } from "sharp";
import { CacheImages } from "./cacheImages";
import identifyFormat from "../utils/identifyFormat";
import { addFileMetadata } from "../utils/addMetadata";

const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const pathToSave = `./dist/imgstorage/`;

export class ImageEditor {
  imgName: string;
  fullEditImgName: string;
  data: Buffer;

  constructor(protected imgFullName: string, protected width: number,
    protected height: number, ua: Details, protected format: string) {
    if (this.format === null) {
      this.format = identifyFormat(ua);
    }

    this.imgName = imgFullName.split('.')[0];
    this.fullEditImgName = this.imgName + '.' + this.format;
  }

  async isExistFile(): Promise<boolean> {
    const cachedDirFiles = await readdir('dist/imgstorage');

    return !!cachedDirFiles.find(file => file === this.fullEditImgName);
  }

  async editImage(): Promise<{ value: Buffer; type: string; }>  {
    const res = {
      value: null,
      type: null
    }
    const image = await readFile(`./dist/uploads/${this.imgFullName}`);
    const resizedImg = this.resizePicture(image, +this.width, +this.height);

    if (this.format) {
      if (this.format === 'avif') this.data = await resizedImg.avif({}).toBuffer();
      if (this.format === 'webp') this.data = await resizedImg.webp({}).toBuffer();

      res.type = `image/${this.format}`;
    } else {
      this.data = await resizedImg.toBuffer();

      res.type = `${mime.lookup(`./dist/uploads/${this.imgFullName}`)}`;
    }

    new CacheImages(this.fullEditImgName, this.data).saveImages();

    res.value = this.data;

    return res;
  }

  async getEditedImage(): Promise<{ value: Buffer; type: string; }> {
    let res = null;
    const isSavedPicture = await this.isExistFile();
    if (isSavedPicture) {
      const img = await readFile(`./dist/imgstorage/${this.fullEditImgName}`);
      addFileMetadata(this.fullEditImgName);

      res = {
        type:`${mime.lookup(pathToSave + this.fullEditImgName)}`,
        value: img
      }
    } else {
      res = this.editImage();
    }

    return res;
  }

  resizePicture(image: Buffer, width: number, height: number): Sharp {
    let resizedImg: Sharp;
    const sharpInstance = sharp(image, {failOnError: false});

    try {
      if (width && !height) {
        resizedImg = sharpInstance.resize({ width: +width });
      } else if (!width && height) {
        resizedImg = sharpInstance.resize({ height: +height });
      } else if (!width && !height) {
        resizedImg = sharpInstance;
      } else {
        resizedImg = sharpInstance
        .resize({
          width: +width,
          height: +height,
          fit: sharp.fit.cover
        });
      }
    } catch (err) {
      throw new Error(err.message)
    }

    return resizedImg;
  }
}
