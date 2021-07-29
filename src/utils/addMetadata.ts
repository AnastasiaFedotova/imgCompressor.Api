import client from '../db/db';
import util from 'util';

const get = util.promisify(client.get).bind(client);
const set = util.promisify(client.set).bind(client);
const expire = util.promisify(client.expire).bind(client);
const exists = util.promisify(client.exists).bind(client);
const zincrby = util.promisify(client.zincrby).bind(client);
const zadd = util.promisify(client.zadd).bind(client);
const zrank = util.promisify(client.zrank).bind(client);

const timeLifeInSec = 60;//86400;

const addFileMetadata = async (keyName: string, size?: string): Promise<void> => {
  const existsActualList = await exists('actualImagesList');

  if (existsActualList) {
    const actualImgData = await zrank('actualImagesList', keyName);

    if (actualImgData !== null) {
      zincrby('actualImagesList', 1, keyName);
    }
  }

  if (await zrank('allImagesList', keyName) === null) {
    if (!existsActualList) {
      await zadd('actualImagesList', 1, keyName);
      expire('actualImagesList', timeLifeInSec);
    }

    await zadd('allImagesList', 1, keyName);
    await zadd('actualImagesList', 1, keyName);
    set(`size_${keyName}`, size);

    addGlobalMetadata(size);
  } else {
    zincrby('allImagesList', 1, keyName);
  }
}

const addGlobalMetadata = async (size: string): Promise<void> => {
  const globalImagesSize = await get('globalImagesSize');

  if (globalImagesSize) {
    set('globalImagesSize', String(+globalImagesSize + +size));
  } else {
    set('globalImagesSize', size);
  }
}

export {
  addFileMetadata,
  addGlobalMetadata
};

