const fs = require('fs');
const util = require("util");
const logger = require("./Logger")("MPQEditor");
const exec = util.promisify(require('child_process').exec);
const execSync = require('child_process').execSync;

class MPQEditor {
    constructor() {
        let path, path64;
        try {
            path = fs.realpathSync(__dirname + "/../../bin/MPQEditor.exe")
            logger.debug("MPQEditor path: " + path);
            path64 = fs.realpathSync(__dirname + "/../../bin/MPQEditor_x64.exe")
            logger.debug("MPQEditor 64bit path: " + path64);
        } catch (e) {
            logger.error(e.message);
        }
        this.mpqEditorPath = path;
        this.isWindows = process.platform === "win32";

        if (!this.isWindows) {
            try {
                this.winePath = execSync("which wine", { encoding: "utf8" }).replace(/\n/g, "");
            } catch (e) {
                logger.warn("Executable 'wine' was not found. Trying wine64...");
                try {
                    this.winePath = execSync("which wine64", { encoding: "utf8" }).replace(/\n/g, "");
                    this.mpqEditorPath = path64;
                } catch (e) {
                    logger.error("Fatal: wine/win64 executable was not found in $PATH. Exiting...");
                    process.exit(1)
                }
            }
        }
    }

    async createMPQ(outFile, srcDir) {
        if (this.isWindows) {
            return exec(`"${this.mpqEditorPath}" a "${outFile}" "${srcDir}" /c /auto /r`)
        } else {
            return exec(`"${this.winePath}" "Z:/${this.mpqEditorPath}" a "Z:/${outFile}" "Z:/${srcDir}" /c /auto /r`)
        }
    }

    async extractMPQ(inFile, outDir, filter) {
        if (this.isWindows) {
            return exec(`"${this.mpqEditorPath}" e "${inFile}" "${filter}" "${outDir}" /fp`)
        } else {
            return exec(`"${this.winePath}" "Z:/${this.mpqEditorPath}" e "Z:/${inFile}" "${filter}" "Z:/${outDir}" /fp`)
        }
    }

}

module.exports = MPQEditor;
