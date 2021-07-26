import client from '../db/db';
import util from 'util';

const get = util.promisify(client.get).bind(client);
const set = util.promisify(client.set).bind(client);
const exists = util.promisify(client.exists).bind(client);
const zincrby = util.promisify(client.zincrby).bind(client);
const zadd = util.promisify(client.zadd).bind(client);
const zrank = util.promisify(client.zrank).bind(client);

const addFileMetadata = async (keyName: string, size: string): Promise<void> => {
  if (await zrank('imagesList', keyName)) {
    zincrby('imagesList', keyName, 1);
  } else {
    zadd('imagesList', 1, keyName);
    set(keyName, size);
  }

  addGlobalMetadata(size);
}

const addGlobalMetadata = async (size: string): Promise<void> => {
  if (await exists('globalImagesSize')) {
    const globalImagesSize = await get('globalImagesSize');
    set('globalImagesSize', String(+globalImagesSize + +size));
  } else {
    set('globalImagesSize', size);
  }
}

export {
  addFileMetadata,
  addGlobalMetadata
};

