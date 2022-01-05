const fs = require('fs');
const util = require("util");
const logger = require("./Logger")("MPQEditor");
const exec = util.promisify(require('child_process').exec);
const execSync = require('child_process').execSync;

class MPQEditor {
    constructor() {
        let path;
        try {
            path = fs.realpathSync(__dirname + "/../../bin/MPQEditor.exe")
            logger.debug("MPQEditor path: " + path);
        } catch (e) {
            logger.error(e.message);
            process.exit(1);
        }
        this.mpqEditorPath = path;
        this.isWindows = process.platform === "win32";

        if (!this.isWindows) {
            try {
                this.winePath = execSync("which wine");;
            } catch (e) {
                logger.error(e.message);
                process.exit(1);
            }
        }
    }

    async createMPQ(outFile, srcDir) {
        if (this.isWindows) {
            return exec(`"${this.mpqEditorPath}" a "${outFile}" "${srcDir}" /c /auto /r`)
        } else {
            // Wine path requires a Z: path
            return exec(`"${this.winePath}" "${this.mpqEditorPath}" a "Z:/${outFile}" "Z:/${srcDir}" /c /auto /r`)
        }
    }

    async extractMPQ(inFile, outDir, filter) {
        if(this.isWindows){
            return exec(`"${this.mpqEditorPath}" e "${inFile}" "${filter}" "${outDir}" /fp`)
        } else {
            return exec(`"${this.winePath}" "${this.mpqEditorPath}" e "Z:/${inFile}" "${filter}" "Z:/${outDir}" /fp`)
        }
    }

}

module.exports = MPQEditor;










