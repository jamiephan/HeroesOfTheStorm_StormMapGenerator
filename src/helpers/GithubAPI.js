const fetch = require("node-fetch")
const util = require('util');

const host = require("./GithubAPIHost")
const tutorialMaps = require("./TutorialMaps")

const client = require("../redis")
client.get = util.promisify(client.get);
client.set = util.promisify(client.set);

const EXPIRE_SECONDS = 60
const GithubAPI = async (type) => {
  // Redis Caching
  const result = await client.get(type.name)
  if (result) {
    return JSON.parse(result)
  } else {
    // Do API
    const response = await fetch(type.url)
    const responseJson = await response.json()
    const parsedData = type.parser(responseJson)
    await client.setex(type.name, EXPIRE_SECONDS, JSON.stringify(parsedData))
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