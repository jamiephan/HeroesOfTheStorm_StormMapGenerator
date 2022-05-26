import React, { useContext, useEffect } from 'react'
import FileManager from '../FileManager/FileManager'
import BuildXMLTemplate from '../../helpers/BuildXMLTemplate'
import XMLValidate from '../../helpers/XMLValidate'
import useLocalStorage from '../../hooks/useLocalStorage'
import GlobalContext from "../../contexts/GlobalContext"

export default function XMLFiles() {

    const { dispatch } = useContext(GlobalContext)
    const [xmlFileList, setXmlFileList] = useLocalStorage("xml", [], "file");


    useEffect(() => {
        dispatch({ type: "APPEND_SETTINGS", settings: { xmlFiles: xmlFileList } })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [xmlFileList])

    return (
        <FileManager files={xmlFileList} setFiles={setXmlFileList} fileType="xml" mimeType="application/xml" validator={XMLValidate} template={BuildXMLTemplate}>
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
    )
}  
