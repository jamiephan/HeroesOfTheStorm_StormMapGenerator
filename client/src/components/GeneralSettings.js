import React, { useEffect, useState } from 'react'

import { Form } from 'react-bootstrap'
import useLocalStorage from '../hooks/useLocalStorage'

export default function GeneralSettings(props) {

  // Dropdown list
  const [listMaps, setListMaps] = useState([])
  const [listTryMode20Maps, setListTryMode20Maps] = useState([])
  const [listAIComps, setListAIComps] = useState([])

  const [isUsingTryMode20, setIsUsingTryMode20] = useLocalStorage("isUsingTryMode20", false, "bool")
  const [isUsingAIComp, setIsUsingAIComp] = useLocalStorage("isUsingAIComp", false, "bool")

  // Form States
  const [name, setName] = useLocalStorage("name", "My Map", "key")
  const [map, setMap] = useLocalStorage("map", "", "key")
  const [map20, setMap20] = useLocalStorage("map20", "", "key")
  const [ai, setAi] = useLocalStorage("ai", "", "key")
  const [msg, setMsg] = useLocalStorage("msg", "", "key")

  // When site loaded
  useEffect(() => {

    (async () => {

      props.loadingMap(true)

      // Load live maps
      const mapsResponse = await fetch("/list/maps")
      const mapsJson = await mapsResponse.json()
      setListMaps(mapsJson)

      // Load Live Try Mode 2.0 Maps
      const maps20Response = await fetch("/list/trymode20")
      const maps20Json = await maps20Response.json()
      setListTryMode20Maps(maps20Json)

      // Load AI comps
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

      props.loadingMap(false)

    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  useEffect(() => {

    props.onChange({
      name, map, map20, ai, msg, isUsingTryMode20, isUsingAIComp
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, map, map20, ai, msg, isUsingTryMode20, isUsingAIComp])

  return (
    <>
      {/* Map Name */}
      <Form.Group className="mb-3">
        <Form.Label>The name of the map:</Form.Label>
        <Form.Control type="text" placeholder="My Map" required value={name} onChange={e => setName(e.target.value)} onBlur={e => e.target.value === "" ? setName("My Map") : null} />
        <Form.Text className="text-muted">
          This is the name of the map during the loading screen (the title text showing "<code>Welcome to {name}</code>"), as well as the downloaded filename (<code>{name}.stormmap</code>) for your map.
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
    </>
  )
}
