const fetch = require("node-fetch")
const express = require("express")

const respError = require("../../Model/Responses/Error")
const host = require("../../helpers/GithubAPIHost")
const tutorialMaps = require("../../helpers/TutorialMaps")
const router = express.Router()

const validateBuildParams = require("../../middleware/validation/validateBuildParams")

const StormMapGenerator = require("../../helpers/StormMapGenerator")

router.post("/", validateBuildParams, async (req, res) => {
  const { name, map, ai, debug, msg, xmlFiles, trymode20 } = req.body

  let mapLink = ""

  if (trymode20 === true) {
    let MapResponse;
    try {
      MapResponse = await fetch(`https://${host}/repos/jamiephan/HeroesOfTheStorm_TryMode2.0/releases`)
    } catch (e) {
      return res.status(500).json(respError("Github API Error"))
    }
    const MapJson = await MapResponse.json()
    const trymode20maps = MapJson[0].assets.map(m => m.name)
    if (!trymode20maps.includes(map)) {
      return res.status(406).send(respError("Invalid Try Mode 2.0 Map"))
    }

    mapLink = MapJson[0].assets.find(x => x.name === map)["browser_download_url"]

  } else {
    let MapResponse;
    try {
      MapResponse = await fetch(`https://${host}/repos/jamiephan/HeroesOfTheStorm_S2MA/contents/maps`)
    } catch (e) {
      return res.status(500).json(respError("Github API Error"))
    }
    const MapJson = await MapResponse.json()
    if (!MapJson.map(m => m.name).filter(m => !tutorialMaps.includes(m)).includes(map)) {
      return res.status(406).send(respError("Invalid Map"))
    }

    if (ai !== "none") {
      mapLink = `https://raw.githubusercontent.com/jamiephan/HeroesOfTheStorm_AIMaps/main/maps/${ai}/${encodeURIComponent(map)}`
    } else {
      mapLink = MapJson.filter(m => m.name === map)[0]["download_url"]
    }

  }
  try {
    const stormmap = new StormMapGenerator(name, debug, msg, mapLink, xmlFiles)
    const mapBinary = await stormmap.get()

    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Content-Disposition", `attachment; filename="${name.replace(/\"/g, "")}"; filename*=UTF-8''${encodeURIComponent(name)}`)
    res.setHeader("Content-Type", "application/octet-stream")

    res.end(mapBinary)
  } catch (e) {
    console.error(e)
    return res.status(500).json(respError("Server Error"))

  }
})

module.exports = router