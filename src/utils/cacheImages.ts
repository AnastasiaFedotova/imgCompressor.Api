import fs from "fs";
import util from "util";
import client from "../db/db";
const klbInMb = 1024;

const removeByFullness = async (metaDataFiles) => {
  const limit = 0.1;
  console.log(metaDataFiles.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0))
  while (metaDataFiles.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0) > limit) {
    console.log(metaDataFiles);
    const minFileByView = metaDataFiles.reduce((accumulator, currentValue) => {
      return currentValue.viewsCount > accumulator.viewsCount ? accumulator : currentValue
    });

    await util.promisify(fs.unlink)(minFileByView.path);

    const removedFileIndex = metaDataFiles.findIndex(metadata => metadata.path === minFileByView.path);

    metaDataFiles.splice(removedFileIndex, 1);
  }

  return metaDataFiles;
}

const saveFileDataToDb = async (data) => {
  client.get('files', async (_err, dataFiles) => {
    const metaDataFiles = JSON.parse(dataFiles);
    metaDataFiles.push(data);
    client.set('files', JSON.stringify(metaDataFiles));
  })
}


export default async (fileName: string, data: Buffer): Promise<void> => {
  const stat = util.promisify(fs.stat);
  const hget = util.promisify(client.hget).bind(client);
  const storagePath = "./dist/imgstorage/";

  client.exists('files', async (err, reply) => {
    if (err) throw err;

    if (reply === 1) {
      client.get('files', async (_err, dataFiles) => {
        const metaDataFiles = JSON.parse(dataFiles);

        client.set('files', JSON.stringify(await removeByFullness(metaDataFiles)));
      })
    } else {
      const files = (await util.promisify(fs.readdir)(storagePath)).filter(file => file != '.DS_Store');

      const metaDataFilesPromises = files.map(async (file) => {
        return {
          path: storagePath + file,
          viewsCount: +(await hget(file, "countViews")),
          size: +((await stat(storagePath + file)).size / klbInMb / klbInMb).toFixed(2)
        }
      })

      const metaDataFiles = await Promise.all(metaDataFilesPromises);

      client.set('files', JSON.stringify(await removeByFullness(metaDataFiles)));
    }
  });

  fs.writeFile(storagePath + fileName, data, async (err) => {
    if (err) throw new Error(err.message);

    saveFileDataToDb({
      path: storagePath + fileName,
      viewsCount: +(await hget(fileName, "countViews")),
      size: +((await stat(storagePath + fileName)).size / klbInMb / klbInMb).toFixed(2)
    });
  });
}
