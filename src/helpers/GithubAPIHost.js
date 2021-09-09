const logger = require("../helpers/Logger")("GitHub API Host")
const host = (() => {
  if (process.env.STORMMAP_GITHUB_TOKEN && process.env.STORMMAP_GITHUB_USERNAME) {
    logger.info("Using GitHub API Key")
    return `${process.env.STORMMAP_GITHUB_USERNAME}:${process.env.STORMMAP_GITHUB_TOKEN}@api.github.com`
  } else {
    logger.info("Not Using GitHub API Key")
    return "api.github.com"
  }
})()

module.exports = host