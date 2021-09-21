import React, { useRef, useState } from 'react'
import {
  Alert, Button, Fade, Form, Spinner, Tab, Tabs
} from 'react-bootstrap'
import { CheckLg } from 'react-bootstrap-icons'
import BuildXMLTemplate from '../helpers/BuildXMLTemplate'
import XMLValidate from "../helpers/XMLValidate"
import useLocalStorage from '../hooks/useLocalStorage'
import AdvancedOptions from './AdvancedOptions'
import FileManager from './FileManager/FileManager'
import GeneralSettings from './GeneralSettings'

export default function MainForm() {

  // Settings
  const generalSettings = useRef({ isLoadingMaps: true })
  // XML Files
  const [xmlFiles, setXmlFiles] = useLocalStorage("xml", [], "file")
  // Advanced Options
  const libsOptions = useRef([])


  const [isGenerating, setIsGenerating] = useState(false)

  // Status Alert box
  const [alertBox, setAlertBox] = useState({ show: false, variant: "warning", message: "Why do people use light mode??", dismissible: true })

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsGenerating(true)

    const {
      name, map, map20, ai, msg, isUsingTryMode20, isUsingAIComp
    } = generalSettings.current

    const mapName = name.toLowerCase().endsWith(".stormmap") ? name : name + ".stormmap"
    setAlertBox({ show: true, variant: "info", message: `Generating ${mapName} ...`, dismissible: false })

    const body = JSON.stringify({
      name: mapName,
      map: isUsingTryMode20 ? map20 : map,
      trymode20: isUsingTryMode20,
      ai: (isUsingTryMode20 || !isUsingAIComp) ? "none" : ai,
      msg,
      libsOptions: libsOptions.current,
      xmlFiles,
    })

    const response = await fetch("/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    })

    if (response.status === 200) {
      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a")
      a.href = url
      a.download = mapName
      a.click()
      a.remove()
      setAlertBox({ show: true, variant: "success", message: `Downloaded ${mapName}!`, dismissible: true })
    } else {
      const json = await response.json()
      setAlertBox({ show: true, variant: "danger", message: json.message, dismissible: true })
    }

    setIsGenerating(false)

  }

  return (
    <>
      <Form onSubmit={handleSubmit}>

        <Tabs style={{ marginBottom: "20px" }} transition={Fade} >

          {/* General Settings */}
          <Tab eventKey="general" title="General Settings">
            <h3 style={{ margin: "20px 0px" }}>General Settings</h3>
            <GeneralSettings onChange={gs => generalSettings.current = gs} />
          </Tab>

          {/* XMl File Manager */}
          <Tab eventKey="xmlfile" title="XML Files">
            <h3 style={{ margin: "20px 0px" }}>XML Files</h3>
            <FileManager files={xmlFiles} setFiles={setXmlFiles} fileType="xml" mimeType="application/xml" validator={XMLValidate} template={BuildXMLTemplate}>
              The additional <code>XML</code> (Game Data) files that will be loaded into your custom map.
              <ul>
                <li>
                  For more information about XML data modding, please refer to <a href="https://jamiephan.github.io/HeroesOfTheStorm_TryMode2.0/modding.html#mod-xml" target="_blank" rel="noreferrer">jamiephan/TryMode2.0/modding.html#mod-xml</a>.
                </li>
                <li>
                  Currently only supports Game Data (<code>&lt;Catalog&gt;</code>) type of <code>xml</code> files. Files such as Layouts (<code>&lt;Desc&gt;</code>) are not supported.
                </li>
                <li>
                  These files are stored in your browser's storage, which will retain after a page refresh. Although the size limit is <code>5MB</code>, it should be more than enough for normal XML modding.
                </li>
              </ul>
            </FileManager>
          </Tab>

          {/* Advanced Options */}
          <Tab eventKey="advancedoptions" title="Advanced Options">
            <h3 style={{ margin: "20px 0px" }}>Advanced Options</h3>
            <AdvancedOptions onChange={ao => libsOptions.current = ao} />
          </Tab>

        </Tabs>

        <hr />

        {/* Alert box (status) */}
        <Alert
          show={alertBox.show}
          style={{ margin: "20px 0px" }}
          variant={alertBox.variant}
          dismissible={alertBox.dismissible}
          onClose={() => setAlertBox(b => {
            const bc = Object.assign({}, b)
            bc.show = false
            return bc
          })}
        >
          {alertBox.message}
        </Alert>

        {/* Generate Button */}
        <Form.Group>
          {
            generalSettings.current.isLoadingMaps ?
              <Button variant="outline-info" type="submit" disabled={true}>
                <><Spinner animation="border" size="sm" /> Loading Map Templates...</>
              </Button> :
              <Button variant={isGenerating ? "outline-info" : "info"} type="submit" disabled={isGenerating}>
                {isGenerating ? <><Spinner animation="border" size="sm" /> Generating Map File...</> : <><CheckLg /> Generate</>}
              </Button>
          }
        </Form.Group>
      </Form>

    </>
  )
}
