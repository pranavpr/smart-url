import redis from 'async-redis';

const redisService = {};

const rclient = redis.createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOST
);

rclient.on('error', function(err) {
  throw err;
});

redisService.getURL = id => {
  return rclient.get(id);
};

redisService.setURL = (id, urls) => {
  return rclient.set(id, urls);
};

export default redisService;
