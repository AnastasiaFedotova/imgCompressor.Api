import client from '../db/db';

export default (keyName: string): void => {
  const fieldName = 'countViews';
  client.hexists(keyName, fieldName , (err, reply) => {
    if (err) throw err;

    if (reply === 1) {
      client.hincrby(keyName, fieldName, 1, (_err, data) => {
        console.log(data);
      });
    } else {
      client.hset(keyName, fieldName, '1');
    }
  });
}
