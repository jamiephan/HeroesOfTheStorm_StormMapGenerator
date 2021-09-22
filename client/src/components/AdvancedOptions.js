import React, { useEffect, useRef, useState } from 'react'
import { Accordion, Alert, Button, Form } from 'react-bootstrap'
import { ArrowRight } from 'react-bootstrap-icons'
import useLocalStorage from '../hooks/useLocalStorage'

export default function AdvancedOptions(props) {

  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isShowingAdvancedOptionAlertBox, setIsShowingAdvancedOptionAlertBox] = useLocalStorage("isShowingAdvancedOptionAlertBox", false, "bool")

  const options = useRef([])
  const [flattedOptions, setFlattedOptions] = useState([])

  useEffect(() => {
    (async () => {
      // Load Options
      const optionsResponse = await fetch("/default/libs")
      const optionsJson = await optionsResponse.json()
      options.current = optionsJson

      setFlattedOptions(optionsJson.map(s => s.libraries)
        .reduce((p, n) => p.concat(n))
        .map(x => x.options)
        .reduce((p, n) => p.concat(n))
        .map(x => {
          return { ...x, value: x.default }
        }))

      setIsLoadingOptions(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isLoadingOptions) {

      // Both Array.from and [...flattedOptions] causes some weird glitch...
      const obj = JSON.parse(JSON.stringify(flattedOptions))
        .filter(o => o.default !== o.value)
        .map(x => { delete x.default; delete x.type; return x })

      props.onChange(obj)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flattedOptions])


  const renderType = (o, i, j, k) => {

    const index = flattedOptions.findIndex(x => x.name === o.name)
    const currentValue = flattedOptions[index].value


    switch (o.type) {
      case "bool":
        return <Form.Check key={`${i}-${j}-${k}`}
          type="checkbox"
          id={`options-${o.name}`}
          label={
            <span style={{ cursor: "pointer" }}>
              {
                o.default === currentValue ?
                  <code style={{ color: currentValue ? "green" : "red" }}> {o.type} {o.name} = {currentValue ? "true" : "false"};</code> :
                  <code style={{ color: currentValue ? "green" : "red" }}><b><i>* {o.type} {o.name} = {currentValue ? "true" : "false"};</i></b></code>
              }
            </span>
          }
          checked={currentValue}
          onChange={e => {
            setFlattedOptions(fo => {
              const cp = Array.from(fo)
              cp[index].value = e.target.checked
              return cp
            })
          }
          } />
      case "int":

        return <div key={`${i}-${j}-${k}`}>
          {
            o.default === currentValue ?
              <code>{o.type} {o.name} = </code> :
              <code style={{ fontWeight: "bolder", fontStyle: "italic" }}>* {o.type} {o.name} = </code>
          }
          <Form.Control
            type="number"
            min="-2147483648"
            max="2147483648"
            style={{
              width: "100px",
              display: "inline-block",
              fontSize: "80%",
              padding: "2px",
            }}
            value={currentValue}
            onChange={e => {
              if (parseInt(e.target.value) < parseInt(e.target.min)) e.target.value = e.target.min
              if (parseInt(e.target.value) > parseInt(e.target.max)) e.target.value = e.target.max
              setFlattedOptions(fo => {
                const cp = Array.from(fo)
                cp[index].value = parseInt(e.target.value)
                return cp
              })

            }
            }
          />
          <code>;</code>
        </div>

      case "fixed":

        return <div key={`${i}-${j}-${k}`}>
          {
            o.default === currentValue ?
              <code>{o.type} {o.name} = </code> :
              <code style={{ fontWeight: "bolder", fontStyle: "italic" }}>* {o.type} {o.name} = </code>
          }
          <Form.Control
            type="number"
            // From SC2 Editor
            min="-524287"
            max="524287"
            step="0.0001"
            style={{
              width: "100px",
              display: "inline-block",
              fontSize: "80%",
              padding: "2px",
            }}
            value={currentValue}
            onChange={e => {
              if (parseFloat(e.target.value) < parseFloat(e.target.min)) e.target.value = e.target.min
              if (parseFloat(e.target.value) > parseFloat(e.target.max)) e.target.value = e.target.max
              setFlattedOptions(fo => {
                const cp = Array.from(fo)
                cp[index].value = parseFloat(e.target.value)
                return cp
              })

            }
            }
          />
          <code>;</code>
        </div>
      default:
        return <div><code key={`${i}-${j}-${k}`} style={{ color: "red" }}>Invalid Type: {o.name}</code></div>
    }
  }

  const resetKeyToDefault = key => {
    if (window.confirm(`Reset ${key} to default?`)) {

      const index = flattedOptions.findIndex(x => x.name === key)
      if (index === -1) return

      setFlattedOptions(fo => {
        const cp = Array.from(fo)
        cp[index].value = cp[index].default
        return cp
      })
    }
  }

  return (
    <>

      {isShowingAdvancedOptionAlertBox ?

        <Alert variant="info" dismissible="true" onClose={() => setIsShowingAdvancedOptionAlertBox(false)}>
          <h5>What is this?</h5>
          <ul>
            <li>This section allows you to modify each non-constant variables in the game (currently only supports <code>Boolean</code>, <code>Integer</code> and <code>Decimal</code> type).</li>
            <li>The script will be added into the <code>MapScript.galaxy</code> after all libraries have been initialized (<code>InitLibs()</code>).</li>
            <li>The default values were gathered via the <code>InitVariables()</code> function from their respective library. Therefore it will not track any changes afterwards.</li>
          </ul>
          <h5>Notes:</h5>
          <ul>
            <li>The settings on this page <b>will not</b> be saved on your browser, refreshing will reset to default.</li>
            <li>Some variables depends on certain variables to function properly or some might not have any effect. You will need to test or study the trigger code manually.</li>
            <li>For <code><b>Maps</b></code> and <code><b>Brawl</b></code> libraries, <b>Make sure your map have the required mods, or the map will crash when launched.</b></li>
            <li>For Integer (<code>int</code>) variables, the maximum is <code>2147483648</code> and the minimum is <code>-2147483648</code>.</li>
            <li>For Decimal (<code>fixed</code>) variables, the maximum is <code>524287</code> and the minimum is <code>-524287</code>. Note that the game only accepts maximum <code>4</code> decimal digit, smaller digits will be rounded.</li>
          </ul>
          <h5>How to use this page?</h5>
          <ul>
            <li>All libraries are separated into sections. Click on of of them to expand it.</li>
            <li>Click on each of the libraries to expand all the possible variables to be configured.</li>
            <li>The variable names and default values are identical in game. The data type will be appended to the variable name.</li>
            <li>For <code>boolean</code> type, click on it to toggle <code style={{ color: "green" }}>true</code> or <code style={{ color: "red" }}>false</code> and can be easily identified with its color.</li>
            <li>For both <code>int</code> and <code>fixed</code> type, You can change the value by typing on the textbox. If its over the min/max, it will reset to its type's min/max.</li>
            <li>Any value that is not the same as the default value will be considered as "changed".</li>
            <li>You can track the changes on the "Changes" box below. Click on each of the variable inside the changes box to discard the changes.</li>
          </ul>
          <h5>Some Useful Options:</h5>
          <ul>
            <li>Core <ArrowRight /> Heroes <ArrowRight /> <code>bool libCore_gv_dEBUGDebuggingEnabled</code>: Toggle Debug Mode</li>
            <li>Core <ArrowRight /> Heroes <ArrowRight /> <code>bool libCore_gv_dEBUGPingLimitEnabled </code>: Toggle Ping Limit</li>
            <li>Core <ArrowRight /> Heroes <ArrowRight /> <code>bool libCore_gv_sYSMinionSpawningOn</code>: Toggle Minion Waves</li>
            <li>Core <ArrowRight /> Heroes <ArrowRight /> <code>int libCore_gv_sYSHeroStartLevel</code>: Set the starting Level</li>
            <li>Core <ArrowRight /> Heroes <ArrowRight /> <code>fixed libCore_gv_bALDeathTimeOverride</code>: Override Respawn Timer (Note: The smallest timer is <code>0.0625</code>)</li>
            <li>Core <ArrowRight /> Game <ArrowRight /> <code>bool libGame_gv_afk_UseAFKSystem</code>: Toggle AFK detection</li>
            <li>Core <ArrowRight /> Support <ArrowRight /> <code>bool libSprt_gv_dEBUGNoRegen</code>: Toggle HP / Energy Regen</li>
            <li>Core <ArrowRight /> AI <ArrowRight /> <code>bool libAIAI_gv_heroAIDisplayAIStatus</code>: Toggle showing AI status</li>
          </ul>
        </Alert> :
        <><Button variant="info" onClick={() => { setIsShowingAdvancedOptionAlertBox(true) }}>What is Advanced Option?</Button></>
      }
      <hr />
      <Alert variant="primary">

        <h4>Changes:</h4>
        {
          (flattedOptions.filter(o => o.default !== o.value).length > 0) && (!isLoadingOptions) ?
            <>
              <ul>
                {flattedOptions.filter(o => o.default !== o.value).map(x =>
                  <li key={x.name} onClick={() => resetKeyToDefault(x.name)} style={{ cursor: "pointer" }}>
                    <code>{x.name} = </code>
                    {
                      x.type === "bool" ?
                        <><code style={{ color: x.default ? "green" : "red" }}>{String(x.default)}</code>
                          {" "}
                          <ArrowRight />
                          {" "}
                          <code style={{ color: x.value ? "green" : "red" }}>
                            <b>{String(x.value)}</b>
                          </code>
                        </> : <></>
                    }
                    {
                      x.type === "int" || x.type === "fixed" ?
                        <>
                          <code>{String(x.default)}</code>
                          {" "}
                          <ArrowRight />
                          {" "}
                          <code>
                            <b>{x.value}</b>
                          </code>
                        </> : <></>
                    }

                  </li>
                )}
              </ul>

              <Button variant="danger" onClick={() => {
                if (window.confirm("You sure want to reset ALL the options to default?")) {
                  setFlattedOptions(fo => {
                    const cp = Array.from(fo)
                    for (let index = 0; index < cp.length; index++) {
                      cp[index].value = cp[index].default
                    }
                    return cp
                  })
                }
              }}
              >Reset ALL to default</Button>

            </> : <ul><li><i>No changed were made.</i></li></ul>
        }
      </Alert>
      <hr />
      {
        isLoadingOptions ? <></> :
          <Accordion>{
            options.current.map((s, i) =>
              // Each section
              <Accordion.Item key={`${i}`} eventKey={`${i}`}>
                <Accordion.Header style={{ margin: "0px 0px" }}><h5>{s.title} Libraries (<code>{s.lib}</code>)</h5></Accordion.Header>
                <Accordion.Body>
                  <Accordion style={{ margin: "0px" }}>
                    {
                      s.libraries.map((l, j) =>
                        <Accordion.Item key={`${i}-${j}`} eventKey={`${i}-${j}`}>
                          <Accordion.Header><span>{l.title} Library (<code>{l.lib}</code>)</span></Accordion.Header>
                          <Accordion.Body>
                            {
                              l.options.map((o, k) => renderType(o, i, j, k))
                            }
                            <hr />
                            <Button variant="danger" onClick={() => {
                              if (window.confirm(`You sure want to reset ${l.title} Library to default?`)) {
                                setFlattedOptions(fo => {
                                  const cp = Array.from(fo)
                                  for (let index = 0; index < cp.length; index++) {
                                    if (cp[index].name.startsWith(l.lib)) {
                                      cp[index].value = cp[index].default
                                    }
                                  }
                                  return cp
                                })
                              }
                            }}
                            >{`Reset ${l.title} Library to default`}</Button>
                          </Accordion.Body>
                        </Accordion.Item>
                      )
                    }
                  </Accordion>
                </Accordion.Body>
              </Accordion.Item>
            )}
          </Accordion>
      }
    </>
  )
}
