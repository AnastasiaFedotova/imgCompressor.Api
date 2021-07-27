import client from '../db/db';
import util from 'util';

const get = util.promisify(client.get).bind(client);
const set = util.promisify(client.set).bind(client);
const incr = util.promisify(client.incr).bind(client);
//const hmset = util.promisify(client.hmset).bind(client);
//const hincrby = util.promisify(client.hincrby).bind(client);
//const zincrby = util.promisify(client.zincrby).bind(client);
const zadd = util.promisify(client.zadd).bind(client);
const zrank = util.promisify(client.zrank).bind(client);

const addFileMetadata = async (keyName: string, size?: string): Promise<void> => {
  const imgData = await zrank('imagesList', keyName);

  if (imgData !== null) {
    incr(`countView_${keyName}`);
  } else {
    zadd('imagesList', new Date().getTime(), keyName);

    set(`countView_${keyName}`, 1);
    set(`date_${keyName}`, new Date().getTime());
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

