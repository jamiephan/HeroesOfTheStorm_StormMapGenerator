import React, { useContext, useState } from 'react'
import {
  Alert, Button, Fade, Form, Spinner, Tab, Tabs
} from 'react-bootstrap'
import { CheckLg } from 'react-bootstrap-icons'

import GlobalContext from '../contexts/GlobalContext'
import AdditionalMods from './Tabs/AdditionalMods'
import AdvancedOptions from './Tabs/AdvancedOptions'
import GameString from './Tabs/GameString'
import GeneralSettings from './Tabs/GeneralSettings'
import XMLFiles from './Tabs/XMLFiles'

export default function MainForm() {

  const { state } = useContext(GlobalContext)
  const [isGenerating, setIsGenerating] = useState(false)

  // // Status Alert box
  const [alertBox, setAlertBox] = useState({ show: false, variant: "warning", message: "Why do people use light mode??", dismissible: true })

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsGenerating(true)

    setAlertBox({ show: true, variant: "info", message: `Generating ${state?.installer?.isInstaller && state?.installer?.mapName ? state?.installer?.mapName : state.settings.name} ...`, dismissible: false })



    const response = await fetch("/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        {
          ...state?.settings,
          libsOptions: []
        },
      )
    })

    if (response.status === 200) {
      // To Blob
      const blob = await response.blob()

      // Download the file
      const generateDownload = async (b) => {
        const url = window.URL.createObjectURL(b);
        const a = document.createElement("a")
        a.href = url
        a.download = state.settings.name
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url);
      }

      await generateDownload(blob)

      setAlertBox({
        show: true, variant: "success", message: <>
          {state?.installer?.isInstaller && state?.installer?.mapName ? `Installed ${state?.installer?.mapName}!` : `Generated ${state.settings.name}!`}
          {' '}
          <Button variant="secondary" style={{ marginLeft: "10px" }} onClick={() => generateDownload(blob)}>{state?.installer?.isInstaller && state?.installer?.mapName ? "Install" : "Download"} again</Button>
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
            <GeneralSettings />
          </Tab>


          {/* Additional Mods */}
          <Tabs eventKey="additionalmods" title="Additional Mods">
            <h3 style={{ margin: "20px 0px" }}>Additional Mods</h3>
            <AdditionalMods />
          </Tabs>

          {/* Game Strings */}
          <Tabs eventKey="gamestrings" title="Game Strings">
            <h3 style={{ margin: "20px 0px" }}>Game Strings</h3>
            <GameString />
          </Tabs>

          {/* XMl File Manager */}
          <Tab eventKey="xmlfile" title="XML Files">
            <h3 style={{ margin: "20px 0px" }}>XML Files</h3>
            <XMLFiles />
          </Tab>

          {/* Advanced Options */}
          {/* <Tab eventKey="advancedoptions" title="Advanced Options">
            <h3 style={{ margin: "20px 0px" }}>Advanced Options</h3>
            <AdvancedOptions onChange={ao => libsOptions.current = ao} />
          </Tab> */}


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
            (state?.IsLoadingMaps || state?.isLoadingMods) ?
              <Button variant="outline-info" type="submit" disabled={true}>
                <><Spinner animation="border" size="sm" /> Loading Map Data...</>
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
