const fs = require("fs")
const glob = require("glob")
const sanitize = require("sanitize-filename");
const path = require("path");
const tmp = require("tmp")
const util = require('util');
const xml2js = require('xml2js')

const loggerGenerator = require("../helpers/Logger");
const MPQEditor = require("./MPQEditor")

const copyFile = util.promisify(fs.copyFile)
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)
const deleteFile = util.promisify(fs.unlink)
const mkdir = util.promisify(fs.mkdir)

// Get nested obj, stolen from https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
const getNested = (obj, ...args) => args.reduce((obj, level) => obj && obj[level], obj)
const randId = () => Math.floor(100000 + Math.random() * 900000)

const replace = (buf, a, b) => {
  if (!Buffer.isBuffer(buf)) buf = Buffer(buf);
  const idx = buf.indexOf(a);
  if (idx === -1) return buf;
  if (!Buffer.isBuffer(b)) b = Buffer(b);

  const before = buf.slice(0, idx);
  const after = replace(buf.slice(idx + a.length), a, b);
  const len = idx + b.length + after.length;
  return Buffer.concat([before, b, after], len);
}

const getIndicesOf = (searchStr, str, caseSensitive) => {
  let searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  let startIndex = 0, index, indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}


class StormMapGenerator {
  constructor(name, msg, localModsPath, localMapPath, XMLFiles, libsOptions, gameString) {
    this.logger = loggerGenerator(`Storm Map Generator (${name})`)
    this.logger.debug(`Generator Called: ${name}, ${msg}, ${localMapPath}, ${XMLFiles.length}, ${libsOptions.length}`)
    this.name = name
    this.localMapPath = localMapPath
    this.localModsPath = localModsPath
    this.msg = msg
    this.libsOptions = libsOptions
    this.gameString = gameString
    // Sanitize XML file name + random id
    this.XMLFiles = XMLFiles.map(f => ({ name: randId().toString() + "-" + sanitize(f.name).replace(/ /g, ""), content: f.content }))
    // Bypass Nodejs Windows file handle issue when using MPQEditor.exe
    this.mapFilePath = tmp.tmpNameSync()
    this.mapBinary = null
    this.mpqEditor = new MPQEditor()
  }

  async _patchMap() {

    // Extract the whole map first
    const tempMapObj = tmp.dirSync({ unsafeCleanup: true })
    this.logger.debug(`Extracting ${this.localMapPath} -> ${tempMapObj.name}`)
    await this.mpqEditor.extractMPQ(this.localMapPath, tempMapObj.name, "*")

    // If there are XML Files sbmitted
    if (this.XMLFiles.length > 0) {
      this.logger.info(`Patching XML Files`)
      const modDirName = randId().toString() + "-StormMapGenerator"

      const baseStormData = glob.sync(`${tempMapObj.name}/base.stormdata`, { nocase: process.platform !== "win32", })

      // Get Gamedata File Name
      const gameDataFilesArr = glob.sync(`${baseStormData}/gamedata.xml`, { nocase: process.platform !== "win32", })
      let gameDataXMLPath = gameDataFilesArr.length > 0 ? gameDataFilesArr[0] : null

      // Make the dir for saving mods
      await mkdir(`${baseStormData}/${modDirName}`)

      let gameDataXMLContent
      let gameDataXMLContentParsed = {
        Includes: {
          Catalog: []
        }
      }

      // if Gamedata.xml exist
      if (gameDataXMLPath) {
        gameDataXMLContent = await readFile(`${gameDataXMLPath}`, { encoding: "utf-8" })
        const _gameDataXMLContentParsedTemp = await xml2js.parseStringPromise(gameDataXMLContent)

        const catalogs = getNested(_gameDataXMLContentParsedTemp, "Includes", "Catalog")
        // Check is gamedata legit
        if (catalogs && Array.isArray(catalogs)) {
          // Probably legit, then change the data to Parsed
          this.logger.debug("Has Gamedata.Includes.Catalog and its an array")
          gameDataXMLContentParsed = await xml2js.parseStringPromise(gameDataXMLContent)
        }
      } else {
        gameDataXMLPath = `${baseStormData}/gamedata.xml`
      }


      // Loop each XML file
      this.XMLFiles.forEach(f => {
        // Save XML file to tmp (non async)
        fs.writeFileSync(`${baseStormData}/${modDirName}/${f.name}`, f.content, { encoding: "utf-8" })
        // Push to catalog game data xml
        gameDataXMLContentParsed.Includes.Catalog.push({ '$': { path: `${modDirName}/${f.name}` } })
      });

      gameDataXMLContent = new xml2js.Builder().buildObject(gameDataXMLContentParsed)

      // Save the gamedata file
      await writeFile(`${gameDataXMLPath}`, gameDataXMLContent, { encoding: "utf-8" })

    }

    // If there are stormmod file names submitted
    if (this.localModsPath.length > 0) {
      this.logger.info("Patching StormMod Files, mods=" + this.localModsPath.length)

      const stormmodDirName = randId().toString() + "-StormMods-StormMapGenerator"

      const baseStormData = glob.sync(`${tempMapObj.name}/base.stormdata`, { nocase: process.platform !== "win32", })

      // Get includes.xml File Name
      const includesFilesArr = glob.sync(`${baseStormData}/includes.xml`, { nocase: process.platform !== "win32", })
      let includesXMLPath = includesFilesArr.length > 0 ? includesFilesArr[0] : null

      // Make the dir for saving mods
      await mkdir(`${baseStormData}/${stormmodDirName}`)


      let includesXMLContent
      let includesXMLContentParsed = {
        //   Add id
        Includes: {
          $: { id: "Mods/HeroesData.StormMod" },
          Path: []
        }
      }

      // if includes.xml exist
      if (includesXMLPath) {
        includesXMLContent = await readFile(`${includesXMLPath}`, { encoding: "utf-8" })
        const _includesXMLContentParsedTemp = await xml2js.parseStringPromise(includesXMLContent)

        const paths = getNested(_includesXMLContentParsedTemp, "Includes", "Path")
        // Check is includes legit
        if (paths && Array.isArray(paths)) {
          // Probably legit, then change the data to Parsed
          this.logger.debug("Has Includes.Includes.Catalog and its an array")
          includesXMLContentParsed = await xml2js.parseStringPromise(includesXMLContent)
        }
      } else {
        includesXMLPath = `${baseStormData}/includes.xml`
      }


      // Loop each stormmod file
      this.localModsPath.forEach(f => {

        const filename = randId().toString() + "-" + "StormMods" + "-" + sanitize(f.name).replace(/ /g, "")

        // Copy f.path to stormmodDirName with the new sanitized name
        fs.copyFileSync(f.path, `${baseStormData}/${stormmodDirName}/${filename}`)

        // Push to catalog includes.xml
        includesXMLContentParsed.Includes.Path.push({ '$': { value: `${stormmodDirName}/${filename}` } })
      });

      includesXMLContent = new xml2js.Builder().buildObject(includesXMLContentParsed)

      // Save the includex.xml file
      await writeFile(`${includesXMLPath}`, includesXMLContent, { encoding: "utf-8" })

    }

    // Patch libs variables or welcome message
    if (this.libsOptions.length > 0 || this.msg !== "") {

      this.logger.info(`Patching MapScript File`)

      // Extract MapScript.galaxy
      const mapScriptFilePath = glob.sync(`${tempMapObj.name}/mapscript.galaxy`, { nocase: process.platform !== "win32" })[0]
      let mapScriptFileContent = await readFile(`${mapScriptFilePath}`, { encoding: "utf-8" })

      // Read it
      let mapScriptInsertContentArr = []

      this.libsOptions.forEach(o => {
        mapScriptInsertContentArr.push(`    ${o.name} = ${typeof o.value === "string" ? `"${String(o.value)}"` : String(o.value)};`)
      })

      if (this.msg !== "") mapScriptInsertContentArr.push(`    UIDisplayMessage(PlayerGroupAll(), c_messageAreaDebug, StringToText("${this.msg.replace(/\"/g, "'")}"));`)

      // Modify it
      mapScriptFileContent = mapScriptFileContent.replace("    InitLibs();", [
        `    InitLibs();`,
        ...mapScriptInsertContentArr
      ].join("\n"))

      // Save it
      await writeFile(`${mapScriptFilePath}`, mapScriptFileContent, { encoding: "utf-8" })
    }

    // Patch Game String
    if (this.gameString.length > 0) {
      let gameStringContent;
      const gameStringsFilesArr = glob.sync(`${tempMapObj.name}/enus.stormdata/localizeddata/gamestrings.txt`, { nocase: process.platform !== "win32", })
      let gameStringsFilePath = gameStringsFilesArr.length > 0 ? gameStringsFilesArr[0] : null
      if (gameStringsFilePath) {
        // gameString Exist
        gameStringContent = await readFile(`${gameStringsFilePath}`, { encoding: "utf-8" })
      } else {
        // Does not Exist, 
        gameStringsFilePath = `${tempMapObj.name}/enus.stormdata/localizeddata/gamestrings.txt`
      }

      gameStringContent += "\n" + this.gameString.join("\n")

      // Write to File
      await writeFile(`${gameStringsFilePath}`, gameStringContent, { encoding: "utf-8" })


    }


    // Patch Map name

    this.logger.info(`Patching Map Name`)
    const mapDisplayName = this.name.replace(/\.stormmap/gi, "")
    // Read DocumentHeader
    const documentHeaderPath = glob.sync(`${tempMapObj.name}/documentheader`, { nocase: process.platform !== "win32" })[0]
    let documentHeaderContent = await readFile(`${documentHeaderPath}`)
    // ==================
    const documentHeaderArray = [...new Uint8Array(documentHeaderContent)].map(s => ('0' + s.toString(16)).slice(-2))
    const DocInfoArray = [...new Uint8Array(Buffer.from("DocInfo/NameSUne"))].map(s => ('0' + s.toString(16)).slice(-2))
    const index = documentHeaderArray.join("").lastIndexOf(DocInfoArray.join("")) / 2

    let endIndex = -1
    for (const index1500 of getIndicesOf("1500", documentHeaderArray.join(""), false)) {
      if (index1500 > index) {
        endIndex = (index1500 / 2)
        break;
      }
    }

    const extractedArr = documentHeaderArray.slice(index, endIndex)
    const extractedBuffer = Buffer.from((extractedArr.map(x => parseInt(Number("0x" + x), 10))))
    const newArr = [
      ...DocInfoArray,
      ('0' + mapDisplayName.length.toString(16)).slice(-2),
      "00",
      ...[...new Uint8Array(Buffer.from(mapDisplayName))].map(s => ('0' + s.toString(16)).slice(-2))
    ]
    const newArrBuffer = Buffer.from((newArr.map(x => parseInt(Number("0x" + x), 10))))
    documentHeaderContent = replace(documentHeaderContent, extractedBuffer, newArrBuffer)

    // Save DocumentHeader
    await writeFile(`${documentHeaderPath}`, documentHeaderContent)

    // =======================
    // Build the map
    this.logger.info(`Creating Map`)
    await copyFile(path.resolve("./bin/empty.mpq"), this.mapFilePath)
    this.logger.info(`Adding Files to Map`)
    await this.mpqEditor.createMPQ(this.mapFilePath, tempMapObj.name)
    this.logger.info(`Completed Building Map`)

    // Delete temp folder
    tempMapObj.removeCallback()
  }

  async _readMap() {
    this.mapBinary = await readFile(this.mapFilePath)
    // No need to await to delete the map file
    deleteFile(this.mapFilePath)
    this.mapFilePath = null
  }

  async get() {
    await this._patchMap()
    await this._readMap()
    return this.mapBinary
  }
}

module.exports = StormMapGenerator