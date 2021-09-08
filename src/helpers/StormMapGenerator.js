const tmp = require("tmp")
const fs = require("fs")
const util = require('util');
const xml2js = require('xml2js')
const glob = require("glob")
const sanitize = require("sanitize-filename");

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)
const mkdir = util.promisify(fs.mkdir)
const exec = util.promisify(require('child_process').exec);

// Get nested obj, stolen from https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
const getNested = (obj, ...args) => args.reduce((obj, level) => obj && obj[level], obj)
const randId = () => Math.floor(100000 + Math.random() * 900000)

const defaultLibsOptions = require("../defaultSettings/")
  .libs
  .map(s => s.libraries)
  .reduce((p, n) => p.concat(n))
  .map(x => x.options)
  .reduce((p, n) => p.concat(n))
  .map(x => ({ name: x.name, default: x.default }))

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
  constructor(name, msg, localMapPath, XMLFiles, libsOptions) {
    this.name = name
    this.localMapPath = localMapPath
    this.msg = msg
    this.libsOptions = libsOptions
    // Sanitize XML file name + random id
    this.XMLFiles = XMLFiles.map(f => ({ name: randId().toString() + "-" + sanitize(f.name).replace(/ /g, ""), content: f.content }))

    this.mapFileObj = tmp.fileSync({ unsafeCleanup: true })
    this.mapBinary = null
  }

  async _patchMap() {

    // Extract the whole map first
    const tempMapObj = tmp.dirSync({ unsafeCleanup: true })
    await exec(`wine "/app/bin/MPQEditor.exe" e "Z:/${this.localMapPath}" "*" "Z:/${tempMapObj.name}" /fp`)

    if (this.XMLFiles.length > 0) {

      const modDirName = randId().toString() + "-StormMapGenerator"

      const baseStormData = glob.sync(`${tempMapObj.name}/base.stormdata`, { nocase: true, })

      // Get Gamedata File Name
      const gameDataFilesArr = glob.sync(`${baseStormData}/gamedata.xml`, { nocase: true, })
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
          console.log("Has Gamedata.Includes.Catalog and its an array")
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

    // Patch Debug Mode or message

    if (this.libsOptions.length > 0 || this.msg !== "") {

      // Extract MapScript.galaxy
      const mapScriptFilePath = glob.sync(`${tempMapObj.name}/mapscript.galaxy`, { nocase: true })[0]
      let mapScriptFileContent = await readFile(`${mapScriptFilePath}`, { encoding: "utf-8" })

      // Read it
      let mapScriptInsertContentArr = []

      // if (this.isDebug) mapScriptInsertContentArr.push(`    libCore_gv_dEBUGDebuggingEnabled = true;`)
      this.libsOptions.forEach(o => {
        const defaultLibsOption = defaultLibsOptions.find(x => x.name === o)
        if (defaultLibsOption) {
          mapScriptInsertContentArr.push(`    ${o} = ${String(!defaultLibsOption.default)};`)
        }

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

    // Patch Map name

    const mapDisplayName = this.name.replace(/\.stormmap/gi, "")
    // Read it
    const documentHeaderPath = glob.sync(`${tempMapObj.name}/documentheader`, { nocase: true })[0]
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

    // Save it
    await writeFile(`${documentHeaderPath}`, documentHeaderContent)

    // =======================
    // Build the map
    await exec(`wine "/app/bin/MPQEditor.exe" n "Z:/${this.mapFileObj.name}"`)
    await exec(`wine "/app/bin/MPQEditor.exe" a "Z:/${this.mapFileObj.name}" "Z:/${tempMapObj.name}" /c /auto /r`)

  }

  async _readMap() {
    this.mapBinary = await readFile(this.mapFileObj.name)
    this.mapFileObj.removeCallback()
    this.mapFileObj = null
  }


  async get() {
    await this._patchMap()
    await this._readMap()
    return this.mapBinary
  }
}
module.exports = StormMapGenerator