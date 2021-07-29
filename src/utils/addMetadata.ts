import client from '../db/db';
import util from 'util';

const get = util.promisify(client.get).bind(client);
const set = util.promisify(client.set).bind(client);
const expire = util.promisify(client.expire).bind(client);
const exists = util.promisify(client.exists).bind(client);
const sadd = util.promisify(client.sadd).bind(client);
const sismember = util.promisify(client.sismember).bind(client);
const incr = util.promisify(client.incr).bind(client);

const timeLifeInSec = 60;

const addFileMetadata = async (keyName: string, size?: string): Promise<void> => {
  const existsActualList = await exists('actualImagesList');

  if (await sismember('allImagesList', keyName)) {
    incr(`countViews_${keyName}`);
  } else {
    await sadd('allImagesList', keyName);
    set(`countViews_${keyName}`, '1');

    if (existsActualList) {
      sadd('actualImagesList', keyName);
    } else {
      sadd('actualImagesList', keyName);
      expire('actualImagesList', timeLifeInSec);
    }

    set(`size_${keyName}`, size);
    addGlobalMetadata(size);
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

