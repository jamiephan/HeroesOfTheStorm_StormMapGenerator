import React, { useEffect, useState } from 'react'
import { Accordion, Alert, Button, Form } from 'react-bootstrap'
import { ArrowRight } from 'react-bootstrap-icons'

export default function AdvancedOptions(props) {

  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isShowingAdvancedOptionAlertBox, setIsShowingAdvancedOptionAlertBox] = useState(true)
  const [options, setOptions] = useState([])
  const [changes, setChanges] = useState([])

  useEffect(() => {
    (async () => {
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
      setOptions(optionsJson)
      setIsLoadingOptions(false)
    })()
  }, [])

  useEffect(() => {
    if (!isLoadingOptions) {
      const variables = options.map(s => s.libraries)
        .reduce((p, n) => p.concat(n))
        .map(x => x.options)
        .reduce((p, n) => p.concat(n))

      const tempChanges = []

      for (const variable of variables) {
        if (variable.value !== variable.default) {
          console.log(variable.name)
          tempChanges.push(variable)
        }
      }

      setChanges(tempChanges)
      props.set(tempChanges.map(v => v.name))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])

  return (
    <>
      <div style={{ margin: "20px 0px" }}>
        {isShowingAdvancedOptionAlertBox ?

          <Alert variant="warning" dismissible="true" onClose={() => setIsShowingAdvancedOptionAlertBox(false)}>
            <h5>What is this?</h5>
            <ul style={{ marginBottom: "0" }}>
              <li>This section allows you to modify each non-constant variables in the game (currently only supports <code>Boolean</code> type).</li>
              <li>The script will be injected into the <code>MapScript.galaxy</code> after all libraries have been initialized.</li>
              <li>Each of the sections belows represent a single library from the game. </li>
              <li>The default values were gathered via the <code>InitVariables()</code> function from their respective library.</li>
              <hr />
            </ul>
            <h5>Notes:</h5>
            <ul style={{ marginBottom: "0" }}>
              <li>The settings on this page <b>will not</b> be saved on your browser, refreshing will reset to default.</li>
              <li>Some variables depends on certain variables to function properly or some might not have any effect. You will need to test or study the trigger code manually.</li>
              <li>For <code><b>Maps</b></code> and <code><b>Brawl</b></code> libraries, <b>Make sure your map have the required mods, or the map will crash when launched.</b></li>
              <hr />
            </ul>
            <h5>Useful Options:</h5>
            <ul style={{ marginBottom: "0" }}>
              <li>Core <ArrowRight /> Heroes <ArrowRight /> <code>libCore_gv_dEBUGDebuggingEnabled</code>: Toggle Debug Mode</li>
              <li>Core <ArrowRight /> Heroes <ArrowRight /> <code>libCore_gv_dEBUGPingLimitEnabled </code>: Toggle Ping Limit</li>
              <li>Core <ArrowRight /> Heroes <ArrowRight /> <code>libCore_gv_sYSMinionSpawningOn</code>: Toggle Minion Waves</li>
              <li>Core <ArrowRight /> Game <ArrowRight /> <code>libGame_gv_afk_UseAFKSystem</code>: Toggle AFK detection</li>
              <li>Core <ArrowRight /> Support <ArrowRight /> <code>libSprt_gv_dEBUGNoRegen</code>: Toggle HP / Energy Regen</li>
              <li>Core <ArrowRight /> AI <ArrowRight /> <code>libAIAI_gv_heroAIDisplayAIStatus</code>: Toggle showing AI status</li>
            </ul>
          </Alert> :
          <><Button variant="warning" onClick={() => { setIsShowingAdvancedOptionAlertBox(true) }}>Show Advanced Option Description</Button></>
        }
      </div>
      <h4>Changes:</h4>
      {
        (changes.length > 0) && (!isLoadingOptions) ?
          <>
            <ul>
              {changes.map(x =>
                <li key={x.name}>
                  <code>{x.name} = </code>
                  <code style={{ color: x.default ? "green" : "red" }}>{String(x.default)}</code>
                  {" "}
                  <ArrowRight />
                  {" "}
                  <code style={{ color: x.value ? "green" : "red" }}>
                    <b>{String(x.value)}</b>
                  </code>
                </li>
              )}
            </ul>

            <Button variant="danger" onClick={() => {
              if (window.confirm("You sure want to reset the options to default?")) {
                const ol = JSON.parse(JSON.stringify(options))
                ol.forEach(s => {
                  s.libraries.forEach(d => {
                    d.options.forEach(o => {
                      o.value = o.default
                    })
                  })
                })
                setOptions(ol)
              }
            }}
            >Reset ALL to default</Button>

          </> : <ul><li><i>No changed were made.</i></li></ul>
      }
      {
        isLoadingOptions ? <></> :
          options.map((s, i) =>
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
                            <Form.Check key={`${i}-${j}-${k}`}
                              type="checkbox"
                              id={`options-${o.name}`}
                              label={
                                o.default === o.value ?
                                  <code style={{ color: o.value ? "green" : "red" }}> {o.name} = {o.value ? "true" : "false"};</code> :
                                  <code style={{ color: o.value ? "green" : "red" }}><b><i>* {o.name} = {o.value ? "true" : "false"};</i></b></code>
                              }
                              checked={o.value}
                              onChange={e => {
                                setOptions(o => {
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
                            setOptions(o => {
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
    </>
  )
}
