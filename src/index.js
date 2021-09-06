require("dotenv").config()

const express = require("express")
const fetch = require("node-fetch")

const app = express()

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const respError = require("./Model/Responses/Error")
const StormMapGenerator = require("./StormMapGenerator")

const host = (() => {
  if (process.env.STORMMAP_GITHUB_TOKEN && process.env.STORMMAP_GITHUB_USERNAME) {
    return `${process.env.STORMMAP_GITHUB_USERNAME}:${process.env.STORMMAP_GITHUB_TOKEN}@api.github.com`
  } else {
    return "api.github.com"
  }
})()

const tutorialMaps = [
  "Try Me Mode.stormmap",
  "Tutorial Map Mechanics.stormmap",
  "Tutorial.stormmap",
  "Heroes of the Storm Veteran Challenges.stormmap"
]

app.use(express.static('public'))

app.use("/list", require("./routes/api/list"))
app.use("/templates", require("./routes/api/templates"))

app.get("/ratelimit", async (req, res) => {
  try {
    const response = await fetch(`https://${host}/rate_limit`)
    const json = await response.json()
    res.json(json)
  } catch (e) {
    res.status(500).json(respError("Github API Error"))
  }
})

app.post("/build", async (req, res) => {
  const { name, map, ai, debug, msg, xmlFiles, trymode20 } = req.body

  // Check map name
  if (typeof name !== "string" || name === "") {
    return res.status(406).send(respError("Map Name was not defined."))
  }

  if (!(/^[\x00-\x7F]*$/.test(name))) {
    return res.status(406).send(respError("Map Name contains invalid characters. Only ASCII characters are allowed."))
  }


  // Check trymode20 type
  if (typeof trymode20 !== "boolean") {
    return res.status(406).send(respError("trymode20 must be a Boolean (true/false)"))
  }

  // Check debug type
  if (typeof debug !== "boolean") {
    return res.status(406).send(respError("debug must be a Boolean (true/false)"))
  }

  // Check nsg type
  if (typeof msg !== "string") {
    return res.status(406).send(respError("msg must be a String (text)"))
  }

  if (msg !== "") {
    if (!(/^[\x00-\x7F]*$/.test(msg))) {
      return res.status(406).send(respError("Message contains invalid characters. Only ASCII characters are allowed."))
    }
  }

  // Check XMlFiles Object
  // MY EYES.............
  if (!Array.isArray(xmlFiles)) return res.status(406).send(respError("Invalid XML Files"))
  for (let i = 0; i < xmlFiles.length; i++) {
    const xmlFile = xmlFiles[i];
    if (typeof xmlFile !== "object") return res.status(406).send(respError("Invalid XML Files"))
    if (!('name' in xmlFile) || typeof xmlFile["name"] !== "string" || !(/^[\x00-\x7F]*$/.test(xmlFile["name"]))) return res.status(406).send(respError("Invalid XML file name. Only ASCII characters are allowed"))
    if (!('content' in xmlFile) || typeof xmlFile["content"] !== "string") return res.status(406).send(respError("Invalid XML Files"))
  }

  // Check AI
  if (ai !== "none") {
    let AIResponse;
    try {
      AIResponse = await fetch(`https://${host}/repos/jamiephan/HeroesOfTheStorm_AIMaps/contents/maps`)
    } catch (e) {
      return res.status(500).json(respError("Github API Error"))
    }
    const AIJson = await AIResponse.json()
    if (!AIJson.map(m => m.name).includes(ai)) return res.status(406).send(respError("Invalid AI composition"))
  }

  // Check Map

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

app.all("*", (req, res) => {
  res.redirect("/")
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log("Server Listening on Port " + port.toString())
})