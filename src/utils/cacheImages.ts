import fs from "fs";
import util from "util";
const klbInMb = 1024;

export default async (fileName: string, data: Buffer): Promise<void> => {
  const stat = util.promisify(fs.stat);
  const readFile = util.promisify(fs.readFile);
  const limit = 0.7;
  const storagePath = "./dist/imgstorage/";

  const files = (await util.promisify(fs.readdir)(storagePath)).filter(file => file != '.DS_Store');

  const metaDataFilesPromises = files.map(async (file) => {
    return {
      path: storagePath + file,
      viewsCount: JSON.parse((await readFile(storagePath + file)).toString()).view,
      size: +((await stat(storagePath + file)).size / klbInMb / klbInMb).toFixed(2)
    }
  })

  const metaDataFiles = await Promise.all(metaDataFilesPromises);

  while (metaDataFiles.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0) > limit) {
    const minFileByView = metaDataFiles.reduce((accumulator, currentValue) => {
      return currentValue.viewsCount > accumulator.viewsCount ? accumulator : currentValue
    });

    await util.promisify(fs.unlink)(minFileByView.path);

    const removedFileIndex = metaDataFiles.findIndex(metadata => metadata.path === minFileByView.path);

    metaDataFiles.splice(removedFileIndex, 1);
  }

  const dataToWrite = JSON.stringify({
    view: 0,
    data
  })

  fs.writeFile(storagePath + fileName + ".json", dataToWrite, (err) => {
    if (err) throw new Error(err.message);
  });
}
