const express = require("express")
const templates = require("../../templates")
const logger = require("../../helpers/Logger")("templates")

const router = express.Router()

router.get("/:filetype", async (req, res, next) => {
  logger.debug("Request to templates")
  if (templates.hasOwnProperty(req.params.filetype)) {
    logger.info("Valid Template: " + req.params.filetype)
    res.json(templates[req.params.filetype])
  } else {
    logger.warn("Invalid Template: " + req.params.filetype)
    next()
  }
})

module.exports = router