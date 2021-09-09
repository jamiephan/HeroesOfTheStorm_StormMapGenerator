const fetch = require("node-fetch")
const util = require('util');
const logger = require("../helpers/Logger")("GitHub API")

const host = require("./GithubAPIHost")
const tutorialMaps = require("./TutorialMaps")

const client = require("../redis")
client.get = util.promisify(client.get);
client.set = util.promisify(client.set);

const GithubAPI = async (type) => {
  // Redis Caching
  logger.debug("Checking Redis Cache: " + type.name)
  const result = await client.get(type.name)
  if (result) {
    logger.debug("Redis Cache Exist: " + type.name)
    return JSON.parse(result)
  } else {
    // Do API
    logger.info("Redis Cache Expired: " + type.name)
    const response = await fetch(type.url)
    const responseJson = await response.json()
    const parsedData = type.parser(responseJson)
    await client.setex(type.name, parseInt(process.env.REDIS_API_CACHE_EXPIRE || 1800), JSON.stringify(parsedData))
    logger.debug("Set Redis Cache: " + type.name)
    return parsedData
  }
}

GithubAPI.maps = {
  name: "maps",
  url: `https://${host}/repos/jamiephan/HeroesOfTheStorm_S2MA/contents/maps`,
  parser: j => j.map(m => m.name).filter(m => !tutorialMaps.includes(m))
}

GithubAPI.ai = {
  name: "ai",
  url: `https://${host}/repos/jamiephan/HeroesOfTheStorm_AIMaps/contents/maps`,
  parser: j => j.map(m => m.name)
}

GithubAPI.trymode20 = {
  name: "trymode20",
  url: `https://${host}/repos/jamiephan/HeroesOfTheStorm_TryMode2.0/releases`,
  parser: j => j[0].assets.map(m => m.name)
}

module.exports = GithubAPI