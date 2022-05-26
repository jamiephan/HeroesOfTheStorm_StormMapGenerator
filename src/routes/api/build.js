const express = require("express")
const respError = require("../../Model/Responses/Error")
const router = express.Router()
const logger = require("../../helpers/Logger")("build")

const validateBuildParams = require("../../middleware/validation/validateBuildParams")
const { getMapLocalPath, getModsLocalPath } = require("../../helpers/GetFileLocalPath")

const StormMapGenerator = require("../../helpers/StormMapGenerator")

router.post("/", validateBuildParams, async (req, res) => {
  const { name, map, ai, msg, mods, xmlFiles, trymode20, libsOptions, gameString } = req.body

  let localTemplateMapPath;

  try {
    // Get the Map Path
    localTemplateMapPath = await getMapLocalPath(trymode20, map, ai)
    logger.debug("Local Template Map: " + localTemplateMapPath)
  } catch (e) {
    logger.error(`Error localTemplateMapPath: ${e.message}`)
    return res.status(500).json(respError("Error when loading template map"))
  }

  let localModsPathMapping = [];
  try {
    // Get the Mods Path
    const localModsPath = await Promise.all(mods.map(async (mod) => {
      logger.debug("Loading Mods: " + mod)
      return await getModsLocalPath(mod)
    }
    ))

    logger.debug("Local Mods Paths Array: ")
    logger.debug(localModsPath)
    for (let i = 0; i < mods.length; i++) {
      localModsPathMapping.push({ name: mods[i], path: localModsPath[i] })
    }
  } catch (e) {
    logger.error(`Error localModsPath: ${e.message}`)
    return res.status(500).json(respError("Error when loading mods"))
  }

  try {
    // Create a patched map
    const stormMap = new StormMapGenerator(name, msg, localModsPathMapping, localTemplateMapPath, xmlFiles, libsOptions, gameString)
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