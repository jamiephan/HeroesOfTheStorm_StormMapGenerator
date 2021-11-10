const crypto = require('crypto')
const path = require("path")
const fetch = require("node-fetch")
const fs = require("fs")
const util = require('util');
const logger = require("../helpers/Logger")("cache-files")

const writeFile = util.promisify(fs.writeFile)
const mkdir = util.promisify(fs.mkdir)
const basePath = path.resolve("./_cache_files")

const fileExpireMap = new Map()

const getCombinationId = (...args) => {
  const hash = crypto.createHash('md5')
  hash.update(args.map(x => x.toString()).join("-"))
  return hash.digest('hex')
}


const isExpired = (id) => {
  const value = fileExpireMap.get(id)
  if (!value) return true;

  // Check if cache file exist
  if (!fs.existsSync(`${basePath}/${id}`)) {
    logger.debug(`Cache file ${id} does not exist.`)
    return true;
  }
  return value.expire <= new Date()
}

const getCachePath = async (downloadLink, id) => {

  // Not Expired, so just return the path
  if (!isExpired(id)) {
    logger.debug(`File not expired: ${id} ${downloadLink}`)
    return fileExpireMap.get(id).path
  }
  logger.warn(`File Expired: ${id} ${downloadLink}`)


  // Expired, so download and return the file path

  // Download File
  logger.debug("Downloading File: " + downloadLink)
  const fileResponse = await fetch(downloadLink)
  const fileData = await fileResponse.arrayBuffer()

  // Save to File
  await mkdir(basePath, { recursive: true })
  await writeFile(`${basePath}/${id}`, Buffer.from(fileData))
  logger.debug(`Saved File to ${basePath}/${id}`)

  // Update fileExpireMap
  const expiryDate = new Date()
  expiryDate.setSeconds(expiryDate.getSeconds() + parseInt(process.env.MAP_FILE_CACHE_EXPIRE || 3600));
  logger.debug(`File Expire on ${expiryDate}`)

  fileExpireMap.set(id, {
    path: path.resolve(`${basePath}/${id}`),
    expire: expiryDate
  })

  return fileExpireMap.get(id).path
}


const getMapLocalPath = async (isTryMode, mapName, aiComp) => {

  let downloadLink = ''

  // Find the download link
  // Don't ask me why three of the links looks different 
  if (isTryMode) {
    // Using Try Mode
    downloadLink = `https://github.com/jamiephan/HeroesOfTheStorm_TryMode2.0/releases/latest/download/${encodeURIComponent(mapName)}`
  } else {
    if (aiComp === "none") {
      downloadLink = `https://github.com/jamiephan/HeroesOfTheStorm_S2MA/raw/main/maps/${encodeURIComponent(mapName)}`
    } else {
      downloadLink = `https://raw.githubusercontent.com/jamiephan/HeroesOfTheStorm_AIMaps/main/maps/${aiComp}/${encodeURIComponent(mapName)}`
    }
  }

  const combinationId = getCombinationId(isTryMode, mapName, aiComp)
  return getCachePath(downloadLink, combinationId)

}

const getModsLocalPath = async (modName) => {
  const downloadLink = `https://github.com/jamiephan/HeroesOfTheStorm_S2MA/raw/main/mods/${encodeURIComponent(modName)}`
  return getCachePath(downloadLink, getCombinationId(modName))
}

module.exports = {getMapLocalPath, getModsLocalPath}