const redis = require("redis")
const client = redis.createClient(process.env.REDIS_URL || "//127.0.0.1")

module.exports = client