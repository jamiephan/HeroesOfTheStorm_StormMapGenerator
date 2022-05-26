import React, { useContext, useEffect, useRef, useState } from 'react'

import { Form, Button, ListGroup, ListGroupItem, Spinner } from 'react-bootstrap'
import { PlusLg, Trash } from 'react-bootstrap-icons'
import useLocalStorage from '../../hooks/useLocalStorage'
import GlobalContext from "../../contexts/GlobalContext"

export default function AdditionalMods(props) {

    const { state, dispatch } = useContext(GlobalContext)

    // Dropdown list
    const [listMods, setListMods] = useState([])

    // Form States
    const [mods, setMods] = useLocalStorage("mods", [], "array")
    const [selectedMod, setSelectedMod] = useState("")

    const fullModList = useRef([])

    // When site loaded
    useEffect(() => {

        (async () => {
            dispatch({ type: "SET_IS_LOADING_MODS", loading: true })
            // Load mods
            const modsResponse = await fetch("/list/mods")
            const modsJson = await modsResponse.json()
            fullModList.current = modsJson
            setListMods(modsJson)

            // Remove invalid mods from initial LS state
            setMods(m => m.filter(x => modsJson.includes(x)))

            // Auto select the first mod in list
            setSelectedMod(modsJson.length > 0 ? modsJson[0] : null)

            dispatch({ type: "SET_IS_LOADING_MODS", loading: false })
        })()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    // Add mod to list
    useEffect(() => {

        const filterMods = fullModList.current.filter(y => !mods.includes(y))
        setListMods(filterMods.length > 0 ? filterMods : [])
        setSelectedMod(x => filterMods.includes(x) ? x : filterMods[0])
        dispatch({
            type: "APPEND_SETTINGS", settings: { mods }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mods])

    return (
        <>
            <Form.Group className="mb-3">
                {mods.length > 0 && (<>
                    <Form.Label>Additional <code>*.stormmod</code> Files:</Form.Label>
                    <div style={{ margin: "5px" }}>
                        {
                            mods.length > 0 ? <>
                                <ListGroup>
                                    {
                                        mods.map((m, i) => (
                                            <ListGroupItem key={i} style={{ display: "flex", alignItems: "center" }}>
                                                <b>
                                                    {m.replace(".stormmod", "")}
                                                </b>
                                                <Button variant="danger" style={{ marginLeft: "auto" }} onClick={() => setMods(x => { let a = Array.from(x); a.splice(i, 1); return a })}>
                                                    <Trash />
                                                </Button>
                                            </ListGroupItem>
                                        ))
                                    }
                                </ListGroup>
                            </> : <></>
                        }
                    </div>
                </>)}
                <Form.Text>
                    Additional <code>*.stormmod</code> to be included into the map.
                    <ul>
                        <li>This can e.g. include Infernal Shrine mods into Cursed Hollow for units and behaviors.</li>
                        <li>Note that this might crash some maps if incorrect mods were included. So you might want to experiment a bit.</li>
                        <li>The <code>*.stormmod</code> files are from <a href="https://github.com/jamiephan/HeroesOfTheStorm_S2MA" target="_blank" rel="noreferrer">jamiephan/s2ma</a>, which are the offical mods in-game.</li>
                    </ul>
                </Form.Text>
                {!!state?.IsLoadingMods && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Spinner animation="border" variant="primary" />
                        <span style={{ marginLeft: "10px" }}>
                            Loading Mod Files...
                        </span>
                    </div>
                )}
                {!state?.IsLoadingMods && listMods.length > 0 && (
                    <>
                        <Form.Select value={selectedMod} onChange={e => setSelectedMod(e.target.value)}>
                            {!!state?.IsLoadingMods ?
                                <option>Loading...</option> :
                                <>
                                    {
                                        listMods.map((x, i) => (
                                            <option key={i} value={x}>{x.replace(".stormmod", "")}</option>
                                        ))
                                    }
                                </>
                            }

                        </Form.Select>
                        <Button disabled={!!state?.IsLoadingMods} style={{ marginTop: "15px" }} onClick={
                            () => setMods(v => { let a = [...new Set([...v, selectedMod])]; a.sort(); return a })
                        }>
                            {
                                !state?.IsLoadingMods ?
                                    <><PlusLg />{' '}Add Mod</> : <><Spinner animation="border" size="sm" /> Loading Mod list...</>
                            }
                        </Button>
                    </>
                )}
            </Form.Group>
        </>
    )
}
