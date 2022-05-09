import React, { useContext, useRef, useState } from 'react'
import {
  Alert, Button, Fade, Form, Spinner, Tab, Tabs
} from 'react-bootstrap'
import { CheckLg } from 'react-bootstrap-icons'

import GlobalContext from '../contexts/GlobalContext'
import BuildXMLTemplate from '../helpers/BuildXMLTemplate'
import XMLValidate from "../helpers/XMLValidate"
import useLocalStorage from '../hooks/useLocalStorage'
import AdditionalMods from './AdditionalMods'
import AdvancedOptions from './AdvancedOptions'
import FileManager from './FileManager/FileManager'
import GeneralSettings from './GeneralSettings'

export default function MainForm() {

  const { state } = useContext(GlobalContext)

  // Settings
  const generalSettings = useRef({})
  const additionalMods = useRef([])
  // XML Files
  const [xmlFiles, setXmlFiles] = useLocalStorage("xml", [], "file")
  // Advanced Options
  const libsOptions = useRef([])

  // Button States
  const [isLoadingMap, setIsLoadingMap] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  // Status Alert box
  const [alertBox, setAlertBox] = useState({ show: false, variant: "warning", message: "Why do people use light mode??", dismissible: true })

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsGenerating(true)

    const {
      name, map, map20, ai, msg, isUsingTryMode20, isUsingAIComp
    } = generalSettings.current

    const { mods } = additionalMods.current

    const mapName = name.toLowerCase().endsWith(".stormmap") ? name : name + ".stormmap"
    setAlertBox({ show: true, variant: "info", message: `Generating ${state?.installer?.isInstaller && state?.installer?.mapName ? state?.installer?.mapName : mapName} ...`, dismissible: false })

    const body = JSON.stringify({
      name: mapName,
      map: isUsingTryMode20 ? map20 : map,
      trymode20: isUsingTryMode20,
      ai: (isUsingTryMode20 || !isUsingAIComp) ? "none" : ai,
      msg,
      mods,
      libsOptions: libsOptions.current,
      xmlFiles,
    })

    const response = await fetch("/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    })

    if (response.status === 200) {
      // To Blob
      const blob = await response.blob()

      // Download the file
      const generateDownload = async (b) => {
        const url = window.URL.createObjectURL(b);
        const a = document.createElement("a")
        a.href = url
        a.download = mapName
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url);
      }

      await generateDownload(blob)

      setAlertBox({
        show: true, variant: "success", message: <>
          {state?.installer?.isInstaller && state?.installer?.mapName ? `Installed ${state?.installer?.mapName}!` : `Generated ${mapName}!`}
          {' '}
          <Button variant="secondary" style={{ marginLeft: "10px" }} onClick={() => generateDownload(blob)}>{state?.installer?.isInstaller && state?.installer?.mapName ? `Install` : `Generate`} again</Button>
        </>, dismissible: true
      })
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
            <GeneralSettings onChange={gs => generalSettings.current = gs} loadingMap={setIsLoadingMap} />
          </Tab>

          {/* Additional Mods */}
          <Tabs eventKey="additionalmods" title="Additional Mods">
            <h3 style={{ margin: "20px 0px" }}>Additional Mods</h3>
            <AdditionalMods onChange={am => additionalMods.current = am} />
          </Tabs>

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

        <div style={{ width: "100%", borderBottom: "2px solid rgba(50,251,226,.3)", ...(!alertBox.show ? { margin: "20px 0px" } : {}) }} />

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
            isLoadingMap ?
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
