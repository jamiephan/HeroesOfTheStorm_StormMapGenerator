import React, { useState } from 'react'
import { Alert, Button } from 'react-bootstrap'

export default function BottomSection() {

  const [showChangelog, setShowChangelog] = useState(false)

  return (
    <Alert variant="dark" style={{ marginTop: "20px" }}>
      <Alert.Heading>
        Thank you for using Storm Map Generator!
      </Alert.Heading>
      <p>
        Please note that the map will take around 15 seconds to generate. Please be patient.
      </p>
      <p>
        For instructions on how to run the map, please refer to <a href="https://jamiephan.github.io/HeroesOfTheStorm_TryMode2.0/install.html" target="_blank" rel="noreferrer">jamiephan/TryMode2.0/install.html</a>.
      </p>
      {
        showChangelog ?
          <>
            <Button variant="secondary" onClick={() => setShowChangelog(false)}>Hide Changelog</Button>
            <hr />
            Changelog:
            <ul>
              <li>4.0.0</li>
              <ul>
                <li>BREAKING: Changed site domain to <a href="https://stormmap.jamiephan.net">https://stormmap.jamiephan.net</a></li>
                <li>Change backend host from Heroku to Google Cloud</li>
              </ul>
              <li>3.0.0</li>
              <ul>
                <li>Added the ability to append Game String in <code>GameStrings.txt</code> (<code>enUS</code> locale only)!</li>
                <li>Added the ability to tweak <code>string</code> type variables in Advanced Options!</li>
                <li>Clean up React code space using Context API instead of prop drilling (Except Advanced Options)</li>
                <li>Dramatically increased page load by fetching map data in parallel, rather than sequential</li>
                <li>Prompts (e.g dialog to enter file name) will now auto focus on text field and allow Enter key to submit</li>
                <li>Fix the "Download" again incorrect text label</li>
                <li>Updated "Loading Map Data..." button label</li>
                <li>Fixed Close button in file editor not working while in <code>INSTALLER</code> mode</li>
              </ul>
              <li>2.1.1</li>
              <ul>
                <li>Updated some text labels if on <code>INSTALLER</code> mode</li>
                <li>Added a "Download / Install Again" button after successfully generated</li>
                <li>Now removed the Blob URL once generated to save memory.</li>
              </ul>
              <li>2.1.0</li>
              <ul>
                <li>Added Compatibility Mode (<code>INSTALLER</code> mode) for Try Mode 2.0 Installer!</li>
                <li>Check it out at: <a href="https://github.com/jamiephan/HeroesOfTheStorm_TryMode2.0Installer" target="_blank" rel="noreferrer">https://github.com/jamiephan/HeroesOfTheStorm_TryMode2.0Installer</a></li>
                <li>Navbar is now fixed on the screen and slightly larger</li>
                <li>Added a custom purple scrollbar to match the theme</li>
                <li>Now will change the title if in <code>INSTALLER</code> mode</li>

              </ul>
              <li>2.0.2</li>
              <ul>
                <li>Updated All dialogs (alert/prompt/confirm) to use modal instead of browser's native dialog</li>
                <li>This allows to be run in Electron Application (native prompt were disabled in Electron)</li>
              </ul>
              <li>2.0.1</li>
              <ul>
                <li>Allows the app to be run on Windows</li>
                <li>Removed hard coded path to be run on not just only <code>/app</code></li>
              </ul>
              <li>2.0.0</li>
              <ul>
                <li>Added the ability to include <code>stormmod</code> files!</li>
                <li><code>stormmod</code> files are listed from <a href="https://github.com/jamiephan/HeroesOfTheStorm_S2MA/tree/main/mods" target="_blank" rel="noreferrer">jamiephan/s2ma</a></li>
              </ul>
              <li>1.10.1</li>
              <ul>
                <li>Setup CI for automated deployment</li>
                <li>Auto push to changes to <a href="https://stormmap.jamiephan.net" target="_blank" rel="noreferrer">https://stormmap.jamiephan.net/</a></li>
                <li>Setup <a href="https://hub.docker.com/repository/docker/jamiephan/stormmap" target="_blank" rel="noreferrer">jamiephan/stormmap</a> Docker image</li>
                <li>Auto push to changes to <a href="https://hub.docker.com/repository/docker/jamiephan/stormmap" target="_blank" rel="noreferrer">jamiephan/stormmap</a> image</li>
              </ul>
              <li>1.10</li>
              <ul>
                <li>Removed Redis for easier setup and deployment</li>
              </ul>
              <li>1.9</li>
              <ul>
                <li>Added the ability to tweak <code>fixed (decimal)</code> type variables in Advanced Options</li>
                <li>Updated Advanced Option's description box</li>
                <li>Minor UI update on Advanced Option Page</li>
              </ul>
              <li>1.8</li>
              <ul>
                <li>Increased Advanced Option performance by rewriting the page logic</li>
                <li>Wrapped Top Level libraries in Advanced Option into a drop down menu</li>
                <li>Added path to show top libraries separation</li>
                <li>Minor UI update</li>
              </ul>
              <li>1.7</li>
              <ul>
                <li>The site now uses Dark Mode 🌑!</li>
                <li>Fixed Page flickering when switching between tabs with scrollbar present</li>
              </ul>
              <li>1.6</li>
              <ul>
                <li>Added the ability to tweak <code>Integer</code> type variables in Advanced Options</li>
                <li>Updated Backend validation and functionality to handle this change</li>
                <li>Description Box in Advanced Option will now be remembered when you close it</li>
                <li>Minor UI Update to Advanced Options Menu</li>
              </ul>
              <li>1.5.1</li>
              <ul>
                <li>Reuse an empty MPQ file instead of creating a new one for each request. Result in build time <code>~3-6</code> seconds faster.</li>
              </ul>
              <li>1.5</li>
              <ul>
                <li>Separated sections into tabs: General, XML Files and Advanced Options</li>
                <li>Added Advanced Options to tweak each variables in game (currently only <code>Boolean</code> values)</li>
                <li>Debug option have been removed. Enable <code>libCore_gv_dEBUGDebuggingEnabled</code> for the same result in Advanced Options.</li>
              </ul>
              <li>1.4</li>
              <ul>
                <li>Server Side: Implemented API caching. Fetching map list and AI compositions should see a significant improvement</li>
                <li>Server Side: Implemented Map caching and updated map generation logic, map build time should now <code>~50%</code> faster.</li>
                <li><a href="https://github.com/jamiephan/HeroesOfTheStorm_StormMapGenerator" target="_blank" rel="noreferrer">Now open source!</a></li>
              </ul>
              <li>1.3.1</li>
              <ul>
                <li>Updated some icons</li>
              </ul>
              <li>1.3</li>
              <ul>
                <li>Added Changelog</li>
                <li>Now disables the generate button before map templates were loaded, preventing the <code>Invalid Map</code> error</li>
                <li>All settings (not just xml files) will now use <code>LocalStorage</code>, which persists after F5 refresh</li>
                <li>Now will check if the XML file name contains non-ASCII text</li>
                <li>Updated various text description</li>
              </ul>
              <li>1.2</li>
              <ul>
                <li>Overhauled frontend architecture, allowing reusing components in prepare for <code>galaxy</code> files</li>
                <li>Added hover tooltip on all the buttons in the XML files area</li>
                <li>Added the ability to change the xml files name</li>
                <li>Removed the action button text from the file list to reduce visual clutter</li>
                <li>Minor UI improvements</li>
              </ul>
              <li>1.1</li>
              <ul>
                <li>Now patches the <code>DocumentHeader</code> binary to show map name during loading screen</li>
                <li>Allowing enable debug mode</li>
                <li>Allow adding custom welcome message on the Debug Area when map launched</li>
                <li>Added XML syntax validation functionality</li>
                <li>Added XML examples for beginner modders</li>
                <li>Minor UI improvements</li>
                <li>All XML files now saves on <code>LocalStorage</code>, which persists after F5 refresh</li>
              </ul>
              <li>1.0</li>
              <ul>
                <li>Initial app publish</li>
              </ul>
            </ul>
          </> : <><Button variant="secondary" onClick={() => setShowChangelog(true)}>Show Changelog</Button></>
      }
      <hr />
      <p>
        Created with ❤️ by <a href="https://github.com/jamiephan" target="_blank" rel="noreferrer">Jamie Phan</a>. (<a href="https://github.com/jamiephan/HeroesOfTheStorm_StormMapGenerator" target="_blank" rel="noreferrer">Source Code</a>)
      </p>
      <p>
        <span className="text-muted">Storm Map Generator is a personal project and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Blizzard or Heroes of the Storm.</span>
      </p>

    </Alert>
  )
}
