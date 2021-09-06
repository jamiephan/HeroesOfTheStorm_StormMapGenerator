
const express = require("express")
const templates = require("../../templates")

const router = express.Router()

router.get("/:filetype", async (req, res, next) => {
  if (templates.hasOwnProperty(req.params.filetype)) {
    res.json(templates[req.params.filetype])
  } else {
    next()
  }
})

module.exports = router