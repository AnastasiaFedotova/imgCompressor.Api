import fs from "fs";
const klbInMb = 1024;

function getFolderMbSize(path: string): number {
  let size = 0;

  const files = fs.readdirSync(path);
  for (let i = 0; i < files.length; i++) {
    size += fs.statSync(`${path}${files[i]}`).size;
  }
  return +(size / klbInMb / klbInMb).toFixed(2);
}

export default async (fileName: string, data: Buffer): Promise<void> => {
  const limit = 0.12;
  const storagePath = "./dist/imgstorage/";
  const sizeNewMg = +(Buffer.byteLength(data) / klbInMb / klbInMb).toFixed(2);
  let sizeFoldersMb = +getFolderMbSize(storagePath);

  fs.readdir(storagePath, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      if (sizeFoldersMb + sizeNewMg > limit && file !== '.DS_Store') {
        const sizeFile = fs.statSync(storagePath + file).size;
        sizeFoldersMb -= +(sizeFile / klbInMb / klbInMb).toFixed(2);

        fs.unlink(storagePath + file,function(err){
          if(err) return console.log(err);
        });
      }
    });
  })

  fs.writeFile(storagePath + fileName, data, (err) => {
    if (err) throw new Error(err.message);
  });
}
