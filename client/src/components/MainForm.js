import React, { useEffect, useState } from 'react'
import {
  Accordion,
  Alert, Button, Form, Spinner, Tab, Tabs
} from 'react-bootstrap'
import { ArrowRight, CheckLg } from 'react-bootstrap-icons'
import BuildXMLTemplate from '../helpers/BuildXMLTemplate'
import XMLValidate from "../helpers/XMLValidate"
import useLocalStorage from '../hooks/useLocalStorage'
import FileList from "./FileManager/FileList"
import FileUploadBar from './FileManager/FileUploadBar'


export default function MainForm() {

  // App States
  const [isUsingTryMode20, setIsUsingTryMode20] = useLocalStorage("isUsingTryMode20", false, "bool")
  const [isUsingAIComp, setIsUsingAIComp] = useLocalStorage("isUsingAIComp", false, "bool")
  const [libsOptions, setLibsOptions] = useState([])

  const [isLoadingMaps, setIsLoadingMaps] = useState(true)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isGenerating, setIsGenerating] = useState("")

  // Form States
  const [name, setName] = useLocalStorage("name", "", "key")
  const [map, setMap] = useLocalStorage("map", "", "key")
  const [map20, setMap20] = useLocalStorage("map20", "", "key")
  const [ai, setAi] = useLocalStorage("ai", "", "key")
  const [msg, setMsg] = useLocalStorage("msg", "", "key")

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

      // Load Options
      const optionsResponse = await fetch("/default/libs")
      let optionsJson = await optionsResponse.json()
      for (let i = 0; i < optionsJson.length; i++) {
        const section = optionsJson[i];
        for (let j = 0; j < section.libraries.length; j++) {
          const library = section.libraries[j];
          for (let k = 0; k < library.options.length; k++) {
            const options = library.options[k];
            optionsJson[i].libraries[j].options[k] = {
              value: options.default, name: options.name, default: options.default
            }
          }
        }
      }
      setLibsOptions(optionsJson)
      setIsLoadingOptions(false)



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
      libsOptions: libsOptions
        .map(s => s.libraries)
        .reduce((p, n) => p.concat(n))
        .map(x => x.options)
        .reduce((p, n) => p.concat(n))
        .filter(x => x.value !== x.default)
        .map(x => x.name)
      ,
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
              <Form.Check type="checkbox" label="Use jamiephan's Try Mode 2.0" checked={isUsingTryMode20} onChange={e => setIsUsingTryMode20(e.target.checked)} />
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
                  <Form.Check type="checkbox" label="Include AI" checked={isUsingAIComp} onChange={e => setIsUsingAIComp(e.target.checked)} />
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
          <Tab eventKey="xmlfile" title="XML Files">
            <br />
            {/* XML Files */}

            <Form.Group className="mb-3">

              {/* File List */}
              <Form.Label>Additional <code>XML</code> (Game Data) Files:</Form.Label>
              <FileList
                files={xmlFiles}
                setFiles={setXmlFiles}
                fileType="xml"
                editorValidatorFn={XMLValidate}
              />
              <Form.Text className="text-muted">
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
              </Form.Text>

              {/* File Upload */}
              <FileUploadBar
                files={xmlFiles}
                setFiles={setXmlFiles}
                fileType="xml"
                mimeType="application/xml"
                templateFn={BuildXMLTemplate}
              />
            </Form.Group>
          </Tab>
          <Tab eventKey="advancedoptions" title="Advanced Options">
            <br />
            <Alert variant="warning">
              <ul style={{ marginBottom: "0" }}>
                <li>This section allows you to modify each non-constant variables in the game (currently only supports <code>Boolean</code> type).</li>
                <li>The script will be injected into the <code>MapScript.galaxy</code> after all libraries have been initialized.</li>
                <li>Each of the sections belows represent a single library from the game. </li>
                <li>The default values were gathered via the <code>InitVariables()</code> function from their respective library.</li>
                <hr />
                <li><b>Note:</b> The settings on this page <b>will not</b> be saved on your browser, refreshing will reset to default.</li>
                <li><b>Note:</b> Some variables depends on certain variables to function properly or some might not have any effect. You will need to test or study the trigger code manually.</li>
                <li><b>Note:</b> For <code><b>Maps</b></code> and <code><b>Brawl</b></code> libraries, <b>Make sure your map have the required mods, or the map will crash when launched.</b></li>
              </ul>
            </Alert>
            <h4>Changes:</h4>
            <ul>
              {
                isLoadingOptions ? <></> :
                  libsOptions
                    .map(s => s.libraries)
                    .reduce((p, n) => p.concat(n))
                    .map(x => x.options)
                    .reduce((p, n) => p.concat(n))
                    .map((x, i) => x.value !== x.default ?
                      <li key={i}>
                        <code>{x.name} = </code>
                        <code style={{ color: x.default ? "green" : "red" }}>{String(x.default)}</code>
                        {" "}
                        <ArrowRight />
                        {" "}
                        <code style={{ color: x.value ? "green" : "red" }}>
                          <b>{String(x.value)}</b>
                        </code>
                      </li>
                      : null)
              }
            </ul>
            <br />
            <Button variant="danger" onClick={() => {
              if (window.confirm("You sure want to reset the options to default?")) {
                const ol = JSON.parse(JSON.stringify(libsOptions))
                ol.forEach(s => {
                  s.libraries.forEach(d => {
                    d.options.forEach(o => {
                      o.value = o.default
                    })
                  })
                })
                setLibsOptions(ol)
              }
            }}
            >Reset ALL to default</Button>

            {
              isLoadingOptions ? <></> :
                libsOptions.map((s, i) =>
                  // Each section
                  <React.Fragment key={i}>
                    <hr />
                    <h4>{s.title} Libraries:</h4>
                    <Accordion>
                      {
                        s.libraries.map((l, j) =>
                          <Accordion.Item key={`${i}-${j}`} eventKey={`${i}-${j}`}>
                            <Accordion.Header><span>{l.title} Library (<code>{l.lib}</code>)</span></Accordion.Header>
                            <Accordion.Body>
                              {
                                // <Form.Group className="mb-3" >
                                l.options.map((o, k) =>
                                  <Form.Check key={`${i}-${j}-${k}`} type="checkbox" label={
                                    o.default === o.value ?
                                      <code style={{ color: o.value ? "green" : "red" }}> {o.name} = {o.value ? "true" : "false"};</code> :
                                      <code style={{ color: o.value ? "green" : "red" }}><b><i>* {o.name} = {o.value ? "true" : "false"};</i></b></code>
                                  } checked={o.value} onChange={e => {
                                    setLibsOptions(o => {
                                      // Sorry
                                      const ol = JSON.parse(JSON.stringify(o))
                                      ol[i].libraries[j].options[k].value = e.target.checked
                                      return ol
                                    })
                                  }
                                  } />
                                  // </Form.Group>
                                )
                              }
                              <hr />
                              <Button variant="danger" onClick={() => {
                                if (window.confirm(`You sure want to reset ${l.title} Library to default?`)) {
                                  setLibsOptions(o => {
                                    const ol = JSON.parse(JSON.stringify(o))
                                    ol[i].libraries[j].options.forEach(o => {
                                      o.value = o.default
                                    })
                                    return ol
                                  })
                                }
                              }}
                              >{`Reset ${l.title} Library to default`}</Button>
                            </Accordion.Body>
                          </Accordion.Item>
                        )
                      }
                    </Accordion>
                  </React.Fragment>
                )}
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
