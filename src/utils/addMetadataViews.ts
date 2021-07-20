import fs from 'fs';

export default async (pathFile: string, imgData: {view: number, data: Buffer}): Promise<void> => {
  imgData.view += 1;

  fs.writeFile(pathFile, JSON.stringify(imgData), (err) => {
    if (err) throw err;
  });
}
