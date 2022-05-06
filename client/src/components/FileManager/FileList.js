import React, { useState } from 'react'
import { ListGroup } from 'react-bootstrap'
import useDialogs from '../../hooks/useDialogs'
import FileEditDialog from './FileEditDialog'
import FileListItem from './FileListItem'

export default function FileList(props) {

  const { alert, confirm, prompt } = useDialogs()
  const [editingFile, setEditingFile] = useState({})


  const fileExist = name => props.files.map(f => f.name).includes(name)

  const downloadFile = name => {
    if (!fileExist(name)) {
      return alert("Invalid File Name")
    }

    const { content } = props.files.find(f => f.name.toLowerCase() === name.toLowerCase())
    const blob = new Blob([content])
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a")
    a.href = url
    a.download = name
    a.click()
    a.remove()
  }

  const deleteFile = name => {
    if (!fileExist(name)) {
      return alert("Invalid File Name")
    }

    confirm(`Are you sure you want to delete ${name}?`, (s => {
      if (!!s) props.setFiles(fs => fs.filter(f => f.name !== name))
    }))
  }

  const renameFile = name => {
    if (!fileExist(name)) {
      return alert("Invalid File Name")
    }

    prompt(`Please enter a new name for ${name}: `, newName => {
      if (newName) {
        newName = newName.toLowerCase()
        if (!newName.endsWith("." + props.fileType.toLowerCase())) newName += ("." + props.fileType.toLowerCase())

        if (!fileExist(newName)) {
          props.setFiles(f => {
            const newFiles = Array.from(f)
            const index = f.findIndex(x => x.name === name)
            newFiles[index].name = newName
            return newFiles
          })
        } else {
          alert(`Unable to rename the file. "${newName}" already exist.`)
        }
      } else {
        return alert("Invalid File Name")
      }
    })

  }

  const editFile = name => {
    if (!fileExist(name)) {
      return alert("Invalid File Name")
    }
    // Object assign to clone the object, so it won't update the main files on edit.
    setEditingFile(Object.assign({}, props.files.find(f => f.name.toLowerCase() === name.toLowerCase())))
  }

  const saveFile = () => {
    props.setFiles(fs => {
      const index = fs.findIndex(f => f.name.toLowerCase() === editingFile.name.toLowerCase())
      fs[index].content = editingFile.content
      return fs
    })
  }

  return (
    <>
      <ListGroup>
        {props.files.map((f, i) => <FileListItem
          key={i}
          name={f.name}
          downloadFn={() => downloadFile(f.name)}
          deleteFn={() => deleteFile(f.name)}
          renameFn={() => renameFile(f.name)}
          editFn={() => editFile(f.name)}
        />)}
      </ListGroup>


      <FileEditDialog
        show={Object.keys(editingFile).length > 0}
        fullscreen={true}
        closeFn={() => setEditingFile({})}
        saveFn={() => saveFile()}
        validateFn={props.editorValidatorFn}
        validateOnSave={true}
        language={props.fileType.toLowerCase()}
        editorSyntax={props.editorSyntax}
        promptUnedited={true}
        file={editingFile}
        setFile={setEditingFile}
      />
    </>
  )
}
