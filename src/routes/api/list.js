
const express = require("express")
const GithubAPI = require("../../helpers/githubAPI")

const router = express.Router()

router.get("/:type", async (req, res, next) => {
  if (req.params.type in GithubAPI) {
    res.json(await GithubAPI(GithubAPI[req.params.type]))
  } else {
    next()
  }
})

module.exports = router