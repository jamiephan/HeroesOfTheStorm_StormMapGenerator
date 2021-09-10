import React, { useEffect, useState } from 'react'
import {
  Alert, Button, Form, Spinner, Tab, Tabs
} from 'react-bootstrap'
import { CheckLg } from 'react-bootstrap-icons'
import BuildXMLTemplate from '../helpers/BuildXMLTemplate'
import XMLValidate from "../helpers/XMLValidate"
import useLocalStorage from '../hooks/useLocalStorage'
import AdvancedOptions from './AdvancedOptions'
import FileManager from './FileManager/FileManager'

export default function MainForm() {

  // App States
  const [isUsingTryMode20, setIsUsingTryMode20] = useLocalStorage("isUsingTryMode20", false, "bool")
  const [isUsingAIComp, setIsUsingAIComp] = useLocalStorage("isUsingAIComp", false, "bool")

  const [isLoadingMaps, setIsLoadingMaps] = useState(true)
  const [isGenerating, setIsGenerating] = useState("")

  // Form States
  const [name, setName] = useLocalStorage("name", "", "key")
  const [map, setMap] = useLocalStorage("map", "", "key")
  const [map20, setMap20] = useLocalStorage("map20", "", "key")
  const [ai, setAi] = useLocalStorage("ai", "", "key")
  const [msg, setMsg] = useLocalStorage("msg", "", "key")
  const [libsOptions, setLibsOptions] = useState([])

  // Files
  const [xmlFiles, setXmlFiles] = useLocalStorage("xml", [], "file")

  // Dropdown list
  const [listMaps, setListMaps] = useState([])
  const [listTryMode20Maps, setListTryMode20Maps] = useState([])
  const [listAIComps, setListAIComps] = useState([])


  // Status Alert box
  const [alertBox, setAlertBox] = useState({ show: false, variant: "warning", message: "Why do people use light mode??" })

  // When site loaded
  useEffect(() => {

    (async () => {
      // Load live maps
      // const mapsJson = ["ap.stormmap", "hm.stormmap"]
      const mapsResponse = await fetch("/list/maps")
      const mapsJson = await mapsResponse.json()
      setListMaps(mapsJson)

      // Load Live Try Mode 2.0 Maps
      const maps20Response = await fetch("/list/trymode20")
      const maps20Json = await maps20Response.json()
      setListTryMode20Maps(maps20Json)

      // Load AI comps
      // const aiJson = ["1v1", "5v5"]
      const aiResponse = await fetch("/list/ai")
      const aiJson = await aiResponse.json()
      setListAIComps(aiJson)


      // Self heal states default to first index
      if (mapsJson.findIndex(m => m === map) === -1) {
        setMap(mapsJson[0])
      }

      if (maps20Json.findIndex(m => m === map20) === -1) {
        setMap20(maps20Json[0])
      }

      if (aiJson.findIndex(m => m === ai) === -1) {
        setAi(aiJson[0])
      }

      setIsLoadingMaps(false)

    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])




  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsGenerating(true)

    const mapName = name.toLowerCase().endsWith(".stormmap") ? name : name + ".stormmap"
    setAlertBox({ show: true, variant: "info", message: `Generating ${mapName} ...` })

    const body = JSON.stringify({
      name: mapName,
      map: isUsingTryMode20 ? map20 : map,
      trymode20: isUsingTryMode20,
      ai: (isUsingTryMode20 || !isUsingAIComp) ? "none" : ai,
      msg,
      libsOptions,
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
      setAlertBox({ show: true, variant: "success", message: `Downloaded ${mapName}!` })
    } else {
      const json = await response.json()
      setAlertBox({ show: true, variant: "danger", message: json.message })
    }

    setIsGenerating(false)

  }

  return (
    <>
      <Form onSubmit={handleSubmit}>

        <Tabs>
          <Tab eventKey="general" title="General Settings">
            <br />
            {/* Map Name */}
            <Form.Group className="mb-3">
              <Form.Label>The name of the map:</Form.Label>
              <Form.Control type="text" placeholder="My Map" required value={name} onChange={e => setName(e.target.value)} />
              <Form.Text className="text-muted">
                This is the name of the map during the loading screen (the title text showing "<code>Welcome to {name === "" ? "My Map" : name}</code>"), as well as the downloaded filename (<code>{name === "" ? "My Map" : name}.stormmap</code>) for your map.
              </Form.Text>
            </Form.Group>

            {/* is Using Try Mode 2.0 */}

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="isUsingTryMode"
                label={<>Use <a href="https://github.com/jamiephan/HeroesOfTheStorm_TryMode2.0" target="_blank" rel="noreferrer">Try Mode 2.0</a></>}
                checked={isUsingTryMode20}
                onChange={e => setIsUsingTryMode20(e.target.checked)} />
              <Form.Text>
                {
                  isUsingTryMode20 ?
                    "The generated map will use Try Mode 2.0 maps." :
                    "The generated map will use Official maps."
                }
              </Form.Text>
            </Form.Group>


            {isUsingTryMode20 ?

              <Form.Group className="mb-3">
                <Form.Label>Select the <code>*.stormmap</code> template:</Form.Label>
                <Form.Select value={map20} onChange={e => setMap20(e.target.value)}>
                  {
                    listTryMode20Maps.length > 0 ?
                      listTryMode20Maps.map((m, i) =>
                        <option value={m} key={i}>{m.replace(".stormmap", "")}</option>
                      ) :
                      <option>Loading...</option>
                  }
                </Form.Select>
                <Form.Text className="text-muted">
                  This selection will choose the base template map for your own custom map.
                  The maps are from <a href="https://github.com/jamiephan/HeroesOfTheStorm_TryMode2.0" target="_blank" rel="noreferrer">jamiephan/TryMode2.0</a>.
                </Form.Text>
              </Form.Group> :

              // Start Section for official Map
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Select the <code>*.stormmap</code> template:</Form.Label>
                  <Form.Select value={map} onChange={e => setMap(e.target.value)}>
                    {
                      listMaps.length > 0 ?
                        listMaps.map((m, i) =>
                          <option value={m} key={i}>{m.replace(".stormmap", "")}</option>
                        ) :
                        <option>Loading...</option>
                    }
                  </Form.Select>
                  <Form.Text className="text-muted">
                    This selection will choose the base template map for your own custom map.
                    The maps are from <a href="https://github.com/jamiephan/HeroesOfTheStorm_S2MA" target="_blank" rel="noreferrer">jamiephan/s2ma</a>,
                    or <a href="https://github.com/jamiephan/HeroesOfTheStorm_AIMaps" target="_blank" rel="noreferrer">jamiephan/AIMaps</a> if AI were selected.
                  </Form.Text>
                </Form.Group>

                {/* is Using AI Comp  Checkbox*/}

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isIncludeAI"
                    label="Include AI"
                    checked={isUsingAIComp}
                    onChange={e => setIsUsingAIComp(e.target.checked)} />
                  <Form.Text>
                    {
                      isUsingAIComp ?
                        "The map will include AIs in the game." :
                        "The map will not include any AIs. Only yourself will be loaded into the game."
                    }
                  </Form.Text>
                </Form.Group>

                {
                  isUsingAIComp ?
                    // Is using AI comp
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Select the AI Compositions:</Form.Label>
                        <Form.Select value={ai} onChange={e => setAi(e.target.value)}>
                          {
                            listAIComps.map((a, i) =>
                              <option value={a} key={i}>{a}</option>
                            )
                          }
                        </Form.Select>
                        <Form.Text className="text-muted">
                          The AI composition is the number of AIs for both team. The number on the left side also include the player yourself.
                          <br />
                          For example: <code>3v4</code> means <i>Player + 2 AI vs 3 AI</i>; <code>1v5</code> means <i>Player + 0 AI vs 5 AI</i>
                          <br />
                          Note that <code>spectator</code> means <i>spectator mode</i>, which is watching 5 AI vs 5 AI.
                        </Form.Text>
                      </Form.Group>
                    </> :
                    // Is NOT using AI comp
                    <></>
                }

              </>
              // End Section for official Map
            }

            {/* Welcome Message */}
            <Form.Group className="mb-3">
              <Form.Label>Welcome message (optional):</Form.Label>
              <Form.Control type="text" placeholder="Welcome to My Map!" value={msg} onChange={e => setMsg(e.target.value)} />
              <Form.Text>
                A message to display on the left of the screen (Debug Area) when the map was loaded. This message is optional.
              </Form.Text>
            </Form.Group>
          </Tab>

          {/* XMl File Manager */}
          <Tab eventKey="xmlfile" title="XML Files">
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
            <AdvancedOptions set={setLibsOptions} get={libsOptions} />
          </Tab>

        </Tabs>

        <hr />

        {/* Generate Button */}
        <Form.Group>
          {
            isLoadingMaps ?
              <Button variant="outline-success" type="submit" disabled={true}>
                <><Spinner animation="border" size="sm" /> Loading Map Templates...</>
              </Button> :
              <Button variant={isGenerating ? "outline-success" : "success"} type="submit" disabled={isGenerating}>
                {isGenerating ? <><Spinner animation="border" size="sm" /> Generating Map File...</> : <><CheckLg /> Generate</>}
              </Button>
          }
        </Form.Group>
      </Form>

      {/* Alert box (status) */}
      <Alert
        show={alertBox.show}
        style={{ margin: "20px 0px" }}
        variant={alertBox.variant}
        onClose={() => setAlertBox(b => b.show = false)}
      >
        {alertBox.message}
      </Alert>
    </>
  )
}
