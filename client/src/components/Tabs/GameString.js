import Editor from '@monaco-editor/react'
import React, { useContext, useEffect } from 'react'
import { Form } from 'react-bootstrap'
import useLocalStorage from '../../hooks/useLocalStorage'
import GlobalContext from "../../contexts/GlobalContext"

export default function GameString() {
    const { dispatch } = useContext(GlobalContext)
    const [value, setValue] = useLocalStorage('gameString', [], 'array')

    useEffect(() => {
        // Dispatch setting onload
        dispatch({ type: "APPEND_SETTINGS", settings: { gameString: value } })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Form.Text>
                Additional Game Strings to be included into the map.
                <ul>
                    <li>This section allows you to add your custom Game Text into the game.</li>
                    <li>This will added to the map file's <code>GameString.txt</code> (or append if the file exist)</li>
                    <li>This allows you to override existing text labels or created a new one</li>
                    <li>The format consists of a key-paired value separated by <code>=</code>.</li>
                    <ul>
                        <li>For Example:</li>
                        <li><code>{`DocInfo/HowToPlaySummaryHeaderTitle=Battlefield of Eternity`}</code></li>
                        <li><code>{`LoadingScreen/Title=<s val="Storm_BoldExtendedXXLarge">Battlefield of Eternity</c>`}</code></li>
                    </ul>
                    <li>Note that currently only <code>enUS</code> locale is supported.</li>
                </ul>
            </Form.Text>
            <Editor
                height="400px"
                options={{
                    codeLens: false,
                    minimap: {
                        enabled: false
                    },
                    scrollBeyondLastLine: false,
                    scrollBeyondLastColumn: 0,
                    cursorSmoothCaretAnimation: true,
                    contextmenu: false,
                    folding: false,
                    quickSuggestions: false,
                    hover: {
                        enabled: false
                    },

                }}
                onChange={(v) => {
                    const val = v.replace(/\r/g, "").split('\n')
                    setValue(val)
                }}
                onMount={(editor) => {
                    editor.onDidBlurEditorWidget(() => {
                        // State does not work here
                        dispatch({ type: "APPEND_SETTINGS", settings: { gameString: editor.getValue().replace(/\r/g, "").split('\n') } })
                    })
                }}
                onValidate
                defaultValue={value.join('\n')}
                value={value.join("\n")}
                theme='vs-dark'

            />
        </>
    )
}
