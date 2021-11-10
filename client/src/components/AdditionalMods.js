import React, { useEffect, useState } from 'react'

import { Form, Button, Dropdown, ListGroup, ListGroupItem, Spinner } from 'react-bootstrap'
import { PlusLg, Trash } from 'react-bootstrap-icons'
import useLocalStorage from '../hooks/useLocalStorage'

export default function AdditionalMods(props) {

    // Dropdown list
    const [listMods, setListMods] = useState([])

    // Form States
    const [mods, setMods] = useLocalStorage("mods", [], "array")
    const [loadedModsList, setLoadedModsList] = useState(false)

    // When site loaded
    useEffect(() => {

        (async () => {
            setLoadedModsList(false)
            // Load mods
            const modsResponse = await fetch("/list/mods")
            const modsJson = await modsResponse.json()
            setListMods(modsJson)

            // Self healing mods and remove invalid mods
            setMods(m => {
                m.map(x => listMods.includes(x) ? x : false).filter(x => x !== false)
                return m
            })

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
                <Dropdown>
                    <Dropdown.Toggle variant="primary" disabled={!loadedModsList}>
                        {
                            loadedModsList ?
                                <><PlusLg /> Add Mods</> : <><Spinner animation="border" size="sm" /> Loading Mod list...</>
                        }
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {
                            listMods.map((m, i) => (
                                <Dropdown.Item key={i} onClick={() => setMods(v => { let a = [...new Set([...v, m])]; a.sort(); return a })}>{m.replace(".stormmod", "")}</Dropdown.Item>
                            ))
                        }
                    </Dropdown.Menu>
                </Dropdown>
            </Form.Group>
        </>
    )
}
