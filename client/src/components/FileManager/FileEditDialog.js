/* eslint-disable react-hooks/exhaustive-deps */
import Editor from '@monaco-editor/react'
import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import {
  BoxArrowRight, Palette, QuestionCircle, Save2, XLg
} from 'react-bootstrap-icons'
import useDialogs from '../../hooks/useDialogs'
import TooltipButton from '../Shared/TooltipButton'

export default function FileEditDialog(props) {

  const { alert, confirm } = useDialogs()
  const [isEditorDarkTheme, setIsEditorDarkTheme] = useState(true)
  const [isUserHatesHisOrHerEyes, setIsUserHatesHisOrHerEyes] = useState(false)

  const [changed, setChanged] = useState(false)

  const onChange = v => {
    props.setFile(f => {
      f.content = v
      return f
    })
    setChanged(true)
  }

  const onClose = () => {
    if (props.promptUnedited && changed) {
      confirm("You have unsaved changes. Do you like to discard any changes?", (s) => {
        if (!!s) props.closeFn()
      })
    } else {
      props.closeFn()
    }
  }

  const onSave = () => {
    if (props.validateOnSave && props.validateFn !== undefined) {
      const result = props.validateFn(props.file.content)
      if (result.error) {
        confirm([
          "Your file contains the following error:",
          "",
          result.message,
          "Ignore the error and continue to save the file?"
        ].join("\n"), s => {
          if (!!s) {
            props.saveFn()
            setChanged(false)
            alert("File Saved!", "Success")
            return true
          }
        })
      } else {
        props.saveFn()
        setChanged(false)
        alert("File Saved!", "Success")
        return true
      }
    }
  }

  const onSaveAndEdit = () => {
    if (onSave()) {
      props.closeFn()
    }
  }

  const onValidate = () => {
    if (props.validateFn !== undefined) {
      const result = props.validateFn(props.file.content)
      if (result.error) {
        alert(result.message)
      } else {
        alert(`${props.language.toUpperCase()} syntax validation success!`, "Success")
      }
    }
  }

  return (
    <Modal show={props.show} fullscreen={props.fullscreen} onHide={onClose} variant="dark">
      <Modal.Header closeButton>
        <Modal.Title>Editing <code>{props.file.name}</code> {props.editorSyntax} </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "0", overflowY: "hidden" }}>
        <Editor
          height="100%"
          defaultLanguage={props.editorSyntax}
          defaultValue={props.file.content}
          theme={isEditorDarkTheme ? "vs-dark" : "light"}
          onChange={onChange}
        /></Modal.Body>
      <Modal.Footer>
        <TooltipButton
          tooltip={"Switch to " + (isEditorDarkTheme ? "Light Theme" : "Dark Theme")}
          variant={isEditorDarkTheme ? "light" : "dark"}
          onClick={() => setIsEditorDarkTheme(s => !s)}
          className="me-auto"
        >
          <Palette />
        </TooltipButton>

        {(isEditorDarkTheme || isUserHatesHisOrHerEyes) ? <></> :
          <TooltipButton
            tooltip={"Click to dismiss and continue to hurt your eyes"}
            variant="warning"
            onClick={() => setIsUserHatesHisOrHerEyes(true)}
            className="me-auto"
          >
            Why are you using light theme? You hate your eyes? <code>#DarkMode</code>
          </TooltipButton>
        }

        {changed ?
          <em style={{ color: "grey" }}>You have unsaved changes*</em>
          : <></>}
        <TooltipButton
          tooltip="Close the editor"
          variant="danger"
          onClick={onClose}
        >
          <XLg /> Close
        </TooltipButton>

        {
          props.validateFn !== undefined ?
            <TooltipButton
              tooltip={`Check the ${props.language.toUpperCase()} syntax and report if any error was found.`}
              variant="secondary"
              onClick={onValidate}
            >
              <QuestionCircle /> Validate
            </TooltipButton>
            : <></>
        }
        <TooltipButton
          tooltip={props.validateOnSave && props.validateFn !== undefined ? "Perform syntax check and save the file" : "Save the file"}
          onClick={onSave}
        >
          <Save2 /> Save
        </TooltipButton>
        <TooltipButton
          tooltip={props.validateOnSave && props.validateFn !== undefined ? "Perform syntax check, save the file and exit the editor" : "Save the file and exit the editor"}
          variant="success"
          onClick={onSaveAndEdit}
        >
          <BoxArrowRight /> Save and Exit
        </TooltipButton>
      </Modal.Footer>
    </Modal>
  )
}
