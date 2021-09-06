const express = require("express")

const respError = require("../../Model/Responses/Error")
const router = express.Router()

const validateBuildParams = require("../../middleware/validation/validateBuildParams")
const GetMapLocalPath = require("../../helpers/GetMapLocalPath")

const StormMapGenerator = require("../../helpers/StormMapGenerator")

router.post("/", validateBuildParams, async (req, res) => {
  const { name, map, ai, debug, msg, xmlFiles, trymode20 } = req.body

  try {
    // Get the Map Path
    const localTemplateMapPath = await GetMapLocalPath(trymode20, map, ai)

    // Create a patched map
    const stormMap = new StormMapGenerator(name, debug, msg, localTemplateMapPath, xmlFiles)
    const mapBinary = await stormMap.get()

    // Set Headers
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(name)}"; filename*=UTF-8''${encodeURIComponent(name)}`)
    res.setHeader("Content-Type", "application/octet-stream")

    // Send the binary
    return res.end(mapBinary)
  } catch (e) {
    console.error(e)
    return res.status(500).json(respError("Server Error"))

  }
})

module.exports = router