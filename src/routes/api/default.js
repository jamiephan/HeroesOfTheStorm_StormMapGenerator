const express = require("express")
const defaultSettings = require("../../defaultSettings")

const router = express.Router()

router.get("/:option", async (req, res, next) => {
  if (defaultSettings.hasOwnProperty(req.params.option)) {
    res.json(defaultSettings[req.params.option])
  } else {
    next()
  }
})

module.exports = router