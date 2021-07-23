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
  client.exists('globalImgsSize', (err, reply) => {
    if (err) throw err;

    if (reply === 1) {
      client.get('globalImgsSize', (_err, val) => {
        client.set('globalImgsSize', String(+val + +size));
      });
    } else {
      client.set('globalImgsSize', size);
    }
  });

  client.rpush('imgsList', keyName);
}

export {
  addFileMetadata,
  addGlobalMetadata
};

