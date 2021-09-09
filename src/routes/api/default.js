const express = require("express")
const defaultSettings = require("../../defaultSettings")
const logger = require("../../helpers/Logger")("default-options")

const router = express.Router()

router.get("/:option", async (req, res, next) => {
  logger.debug("Request to default options")
  if (defaultSettings.hasOwnProperty(req.params.option)) {
    logger.debug("Valid Option: " + req.params.option)
    res.json(defaultSettings[req.params.option])
  } else {
    logger.warn("Invalid Option: " + req.params.option)
    next()
  }
})

module.exports = router