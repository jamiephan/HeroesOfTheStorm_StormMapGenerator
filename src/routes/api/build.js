const express = require("express")
const respError = require("../../Model/Responses/Error")
const router = express.Router()
const logger = require("../../helpers/Logger")("build")

const validateBuildParams = require("../../middleware/validation/validateBuildParams")
const GetMapLocalPath = require("../../helpers/GetMapLocalPath")

const StormMapGenerator = require("../../helpers/StormMapGenerator")

router.post("/", validateBuildParams, async (req, res) => {
  const { name, map, ai, msg, xmlFiles, trymode20, libsOptions } = req.body

  let localTemplateMapPath;

  try {
    // Get the Map Path
    localTemplateMapPath = await GetMapLocalPath(trymode20, map, ai)
    logger.debug("Local Template Map: " + localTemplateMapPath)
  } catch (e) {
    logger.error(`Error localTemplateMapPath: ${e.message}`)
    return res.status(500).json(respError("Error when loading template map"))
  }

  try {
    // Create a patched map
    const stormMap = new StormMapGenerator(name, msg, localTemplateMapPath, xmlFiles, libsOptions)
    logger.info("Generating Map: " + name)
    const mapBinary = await stormMap.get()
    logger.info(`Generated ${name}. Size: ${Buffer.byteLength(mapBinary)}`)
    // Set Headers
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(name)}"; filename*=UTF-8''${encodeURIComponent(name)}`)
    res.setHeader("Content-Type", "application/octet-stream")

    // Send the binary
    return res.end(mapBinary)
  }
  catch (e) {
    logger.error(`Error StormMapGenerator: ${e.message}`)
    return res.status(500).json(respError("Error when generating the map"))
  }
})

module.exports = router