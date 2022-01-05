import React, { useEffect, useState } from 'react'

import { Form, Button, ListGroup, ListGroupItem, Spinner } from 'react-bootstrap'
import { PlusLg, Trash } from 'react-bootstrap-icons'
import useLocalStorage from '../hooks/useLocalStorage'

export default function AdditionalMods(props) {

    // Dropdown list
    const [listMods, setListMods] = useState([])

    // Form States
    const [mods, setMods] = useLocalStorage("mods`", [], "array")
    const [selectedMod, setSelectedMod] = useState("")
    const [loadedModsList, setLoadedModsList] = useState(false)

    // When site loaded
    useEffect(() => {

        (async () => {
            setLoadedModsList(false)
            // Load mods
            const modsResponse = await fetch("/list/mods")
            const modsJson = await modsResponse.json()
            setListMods(modsJson)

            // Remove invalid mods from initial LS state
            setMods(m => m.filter(x => modsJson.includes(x)))
            
            // Auto select the first mod in list
            setSelectedMod(modsJson.length > 0 ? modsJson[0] : "")
            
            setLoadedModsList(true)
        })()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    useEffect(() => {
        props.onChange({
            mods
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mods])

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label>Additional <code>*.stormmod</code> Files:</Form.Label>
                <div style={{ margin: "5px" }}>
                    {
                        mods.length > 0 ? <>
                            <ListGroup>
                                {
                                    mods.map((m, i) => (
                                        <ListGroupItem key={i}>
                                            <b>
                                                {m.replace(".stormmod", "")}
                                            </b>
                                            <Button variant="danger" style={{ float: "right" }} onClick={() => setMods(x => { let a = Array.from(x); a.splice(i, 1); return a })}>
                                                <Trash />
                                            </Button>
                                        </ListGroupItem>
                                    ))
                                }
                            </ListGroup>
                        </> : <></>
                    }
                </div>
                <Form.Text>
                    Additional <code>*.stormmod</code> to be included into the map.
                    <ul>
                        <li>This can e.g. include Infernal Shrine mods into Cursed Hollow for units and behaviors.</li>
                        <li>Note that this might crash some maps if incorrect mods were included. So you might want to experiment a bit.</li>
                        <li>The <code>*.stormmod</code> files are from <a href="https://github.com/jamiephan/HeroesOfTheStorm_S2MA" target="_blank" rel="noreferrer">jamiephan/s2ma</a>, which are the offical mods in-game.</li>
                    </ul>
                </Form.Text>
                <Form.Select value={selectedMod} onChange={e => setSelectedMod(e.target.value)}>
                    {!loadedModsList ?
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
                <Button disabled={!loadedModsList} style={{ marginTop: "15px" }} onClick={
                    () => setMods(v => { let a = [...new Set([...v, selectedMod])]; a.sort(); return a })
                }>
                    {
                        loadedModsList ?
                            <><PlusLg />{' '}Add Mod</> : <><Spinner animation="border" size="sm" /> Loading Mod list...</>
                    }
                </Button>
            </Form.Group>
        </>
    )
}
