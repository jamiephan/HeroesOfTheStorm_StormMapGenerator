const express = require("express")
const GithubAPI = require("../../helpers/GithubAPI")
const logger = require("../../helpers/Logger")("list")

const router = express.Router()

router.get("/:type", async (req, res, next) => {
  logger.debug("Request to List")
  if (req.params.type in GithubAPI) {
    logger.debug("Valid List: " + req.params.type)
    res.json(await GithubAPI(GithubAPI[req.params.type]))
  } else {
    logger.warn("Not a valid list" + req.params.type)
    next()
  }
})

module.exports = router