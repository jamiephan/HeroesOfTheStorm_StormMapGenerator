const tmp = require("tmp")
const fs = require("fs")
const fetch = require("node-fetch")
const util = require('util');
const xml2js = require('xml2js')
const sanitize = require("sanitize-filename");
const e = require("express");

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)
const readDir = util.promisify(fs.readdir)
const mkdir = util.promisify(fs.mkdir)
const exec = util.promisify(require('child_process').exec);

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
  constructor(name, isDebug, msg, downloadLink, XMLFiles) {
    this.name = name
    this.downloadLink = downloadLink
    this.isDebug = isDebug
    this.msg = msg
    // Sanitize XML file name + random id
    this.XMLFiles = XMLFiles.map(f => ({ name: randId().toString() + "-" + sanitize(f.name).replace(/ /g, ""), content: f.content }))

    this.mapFileObj = null
    this.mapBinary = null
  }


  async _downloadMap() {
    this.mapFileObj = tmp.fileSync({ unsafeCleanup: true })
    const map = await fetch(this.downloadLink)
    const mapData = await map.arrayBuffer()
    await writeFile(this.mapFileObj.name, Buffer.from(mapData))

  }

  async _patchMap() {

    const modDirName = randId().toString() + "-StormMapGenerator"

    // Prevent sometimes small latters
    let gameDataFilename = "gamedata.xml"

    // Step 1, Try to extract the gamedata file and read it
    const gamedataDirObj = tmp.dirSync({ unsafeCleanup: true })
    await exec(`wine "/app/bin/MPQEditor.exe" e "Z:/${this.mapFileObj.name}" "base.stormdata/gamedata.xml" "Z:/${gamedataDirObj.name}"`)

    let gameData;

    if (this.XMLFiles.length > 0) {

      const list = await readDir(gamedataDirObj.name)
      if (list.length == 0) {
        gameData = false
      } else {
        gameDataFilename = list[0]
        gameData = await readFile(`${gamedataDirObj.name}/${gameDataFilename}`, { encoding: "utf-8" })
      }

      await mkdir(`${gamedataDirObj.name}/${modDirName}`)

      let xml;
      if (!(gameData === false)) {
        xml = await xml2js.parseStringPromise(gameData)
        const catalogs = getNested(xml, "Includes", "Catalog")
        if (catalogs && Array.isArray(catalogs)) {
          console.log("Has Gamedata.Includes.Catalog and its an array")
        } else {
          console.log("Has Gamedata but fucked up")
          xml = {
            Includes: {
              Catalog: []
            }
          }

        }
      } else {
        console.log("Does not have Gamedata")
        xml = {
          Includes: {
            Catalog: []
          }
        }
      }

      this.XMLFiles.forEach(f => {
        // Save XML files to tmp (non async)
        fs.writeFileSync(`${gamedataDirObj.name}/${modDirName}/${f.name}`, f.content, { encoding: "utf-8" })
        // Push to catalog game data xml
        xml.Includes.Catalog.push({ '$': { path: `${modDirName}/${f.name}` } })
      });

      const xmlString = new xml2js.Builder().buildObject(xml)

      // Save the game data
      await writeFile(`${gamedataDirObj.name}/${gameDataFilename}`, xmlString, { encoding: "utf-8" })

      // Insert the file into MPQ
      await exec(`wine /app/bin/MPQEditor.exe a "Z:/${this.mapFileObj.name}" "Z:/${gamedataDirObj.name}" "base.stormdata" /c /auto /r`)

      gamedataDirObj.removeCallback()

    }

    // Patch Debug Mode or message

    if (this.isDebug || this.msg !== "") {

      const mapScriptDirObj = tmp.dirSync({ unsafeCleanup: true })

      // Extract MapScript.galaxy
      await exec(`wine "/app/bin/MPQEditor.exe" e "Z:/${this.mapFileObj.name}" "MapScript.galaxy" "Z:/${mapScriptDirObj.name}"`)

      // Read it
      let mapScript = await readFile(`${mapScriptDirObj.name}/MapScript.galaxy`, { encoding: "utf-8" })

      let strArr = []

      if (this.isDebug) strArr.push(`    libCore_gv_dEBUGDebuggingEnabled = true;`)
      if (this.msg !== "") strArr.push(`    UIDisplayMessage(PlayerGroupAll(), c_messageAreaDebug, StringToText("${this.msg.replace(/\"/g, "'")}"));`)

      // Modify it
      mapScript = mapScript.replace("    InitTriggers();", [
        `    InitTriggers();`,
        ...strArr
      ].join("\n"))

      // Save it
      await writeFile(`${mapScriptDirObj.name}/MapScript.galaxy`, mapScript, { encoding: "utf-8" })

      // Add to MPQ
      await exec(`wine /app/bin/MPQEditor a "Z:/${this.mapFileObj.name}" "Z:/${mapScriptDirObj.name}/MapScript.galaxy" "MapScript.galaxy" /c /auto`)

      mapScriptDirObj.removeCallback()

    }

    // Patch Map name

    const name = this.name.replace(/\.stormmap/gi, "")

    const documentHDirObj = tmp.dirSync({ unsafeCleanup: true })

    // Extract DocumentHeader
    await exec(`wine "/app/bin/MPQEditor.exe" e "Z:/${this.mapFileObj.name}" "DocumentHeader" "Z:/${documentHDirObj.name}"`)

    // Read it
    let documentH = await readFile(`${documentHDirObj.name}/DocumentHeader`)

    // ==================

    const documentHArr = [...new Uint8Array(documentH)].map(s => ('0' + s.toString(16)).slice(-2))
    const docInfoArr = [...new Uint8Array(Buffer.from("DocInfo/NameSUne"))].map(s => ('0' + s.toString(16)).slice(-2))

    const index = documentHArr.join("").lastIndexOf(docInfoArr.join("")) / 2

    let endIndex = -1
    for (const index1500 of getIndicesOf("1500", documentHArr.join(""), false)) {
      if (index1500 > index) {
        endIndex = (index1500 / 2)
        break;
      }
    }
    const extractedArr = documentHArr.slice(index, endIndex)
    const extractedBuffer = Buffer.from((extractedArr.map(x => parseInt(Number("0x" + x), 10))))
    const newArr = [
      ...docInfoArr,
      ('0' + name.length.toString(16)).slice(-2),
      "00",
      ...[...new Uint8Array(Buffer.from(name))].map(s => ('0' + s.toString(16)).slice(-2))
    ]

    const newArrBuffer = Buffer.from((newArr.map(x => parseInt(Number("0x" + x), 10))))

    documentH = replace(documentH, extractedBuffer, newArrBuffer)

    // =============

    // Save it
    await writeFile(`${documentHDirObj.name}/DocumentHeader`, documentH)

    // Add to MPQ
    await exec(`wine /app/bin/MPQEditor.exe a "Z:/${this.mapFileObj.name}" "Z:/${documentHDirObj.name}/DocumentHeader" "DocumentHeader" /c /auto`)

    documentHDirObj.removeCallback()

  }

  async _readMap() {
    this.mapBinary = await readFile(this.mapFileObj.name)
    this.mapFileObj.removeCallback()
    this.mapFileObj = null
  }


  async get() {
    await this._downloadMap()
    await this._patchMap()
    await this._readMap()
    return this.mapBinary
  }
}
module.exports = StormMapGenerator