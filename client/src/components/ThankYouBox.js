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
