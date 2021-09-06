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
        Please note that the map will take around 5 - 30 seconds (depends on your configuration) to generate. Please be patient.
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
              <li>1.4</li>
              <ul>
                <li>Server Side: Implement API caching. Fetching map list and AI compositions should see a significant improvement</li>
                <li>Server Side: Implement Map caching and updated map generation logic, map build time should now <code>~50%</code> faster.</li>
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
                <li>Now Patches the <code>DocumentHeader</code> binary to show map name during loading screen</li>
                <li>Allowing enable debug mode</li>
                <li>Allow adding custom welcome message on the Debug Area when map launched</li>
                <li>Added XML syntax validation functionality</li>
                <li>Added XML Examples for beginners</li>
                <li>Minor UI improvements</li>
                <li>All XML files now saves on <code>LocalStorage</code>, which persists after F5 refresh</li>
              </ul>
              <li>1.0</li>
              <ul>
                <li>Initial App Publish</li>
              </ul>
            </ul>
          </> : <><Button variant="secondary" onClick={() => setShowChangelog(true)}>Show Changelog</Button></>
      }
      <hr />
      <p>
        Created with ❤️ by <a href="https://github.com/jamiephan" target="_blank" rel="noreferrer">Jamie Phan</a>.
      </p>
    </Alert>
  )
}
