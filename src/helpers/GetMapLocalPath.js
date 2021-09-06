// MPQ Editor requires reading from a path, so kinda pointless to store maps in redis.
const crypto = require('crypto')
const path = require("path")
const fetch = require("node-fetch")
const fs = require("fs")
const util = require('util');

const writeFile = util.promisify(fs.writeFile)
const mkdir = util.promisify(fs.mkdir)
const basePath = path.resolve("./_cache_maps")

const fileExpireMap = new Map()

const EXPIRE_SECONDS = 60

const getCombinationId = (...args) => {
  const hash = crypto.createHash('sha1')
  hash.update(args.map(x => x.toString()).join("-"))
  return hash.digest('hex')
}


const isExpired = (id) => {
  const value = fileExpireMap.get(id)
  if (!value) return true;
  console.log(value)
  return value.expire <= new Date()
}

const getCachePath = async (downloadLink, id) => {

  // Not Expired, so just return the path
  if (!isExpired(id)) {
    console.log("hi")
    return fileExpireMap.get(id).path
  }

  console.log("expired")

  // Expired, so download and return the file path

  // Download Map
  const mapResponse = await fetch(downloadLink)
  const mapData = await mapResponse.arrayBuffer()

  // Save to File
  await mkdir(basePath, { recursive: true })
  await writeFile(`${basePath}/${id}.stormmap`, Buffer.from(mapData))

  // Update fileExpireMap
  const expiryDate = new Date()
  expiryDate.setSeconds(expiryDate.getSeconds() + EXPIRE_SECONDS);

  fileExpireMap.set(id, {
    path: path.resolve(`${basePath}/${id}.stormmap`),
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

module.exports = getMapLocalPath