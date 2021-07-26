import redis from 'redis';
const client = redis.createClient();
client.flushdb( function (_err, succeeded) {
  console.log(succeeded); // will be true if successfull
});
export default client;
