import client from '../db/db';

const addFileMetadata = (keyName: string, size: string): void => {
  client.hexists(keyName, 'countViews', (err, reply) => {
    if (err) throw err;

    if (reply === 1) {
      client.hincrby(keyName, 'countViews', 1);
    } else {
      client.hmset(keyName, {
        'countViews': '1',
        'size': size
      });
    }
  });

  addGlobalMetadata(keyName, size);
}

const addGlobalMetadata = (keyName: string, size: string): void => {
  client.exists('globalImagesSize', (err, reply) => {
    if (err) throw err;

    if (reply === 1) {
      client.get('globalImagesSize', (_err, val) => {
        client.set('globalImagesSize', String(+val + +size));
      });
    } else {
      client.set('globalImagesSize', size);
    }
  });

  client.rpush('imagesList', keyName);
}

export {
  addFileMetadata,
  addGlobalMetadata
};

