const fetch = require("node-fetch")
const logger = require("../helpers/Logger")("GitHub API")

const host = require("./GithubAPIHost")
const tutorialMaps = require("./TutorialMaps")

const cacheDatabase = require("./CacheDatabase")

const GithubAPI = async (type) => {
  // Cache Database
  logger.debug("Checking Cache: " + type.name)
  if(!cacheDatabase.isExpired(type.name)) {
    logger.debug("Cache Exist: " + type.name)
    return cacheDatabase.get(type.name)
  } else {
    logger.info("Cache is expired: " + type.name)
    const response = await fetch(type.url)
    const responseJson = await response.json()
    const parsedData = type.parser(responseJson)
    cacheDatabase.set(type.name, parsedData)
    logger.debug("Set Cache: " + type.name)
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