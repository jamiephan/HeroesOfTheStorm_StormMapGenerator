import React from 'react'
import { Form } from 'react-bootstrap'
import FileList from './FileList'
import FileUploadBar from './FileUploadBar'

export default function FileManager(props) {
  return (
    <>
      <Form.Group className="mb-3">

        {/* File List */}
        <Form.Label>Additional <code>{props.fileType.toUpperCase()}</code> Files:</Form.Label>
        <FileList
          files={props.files}
          setFiles={props.setFiles}
          fileType={props.fileType}
          editorSyntax={props.editorSyntax || props.fileType.toLowerCase()}
          editorValidatorFn={props.validator}
        />

        {/* File Text */}
        <Form.Text className="text-muted">
          {props.children}
        </Form.Text>

        {/* File Upload */}
        <FileUploadBar
          files={props.files}
          setFiles={props.setFiles}
          fileType={props.fileType}
          templateFn={props.template}
        />
      </Form.Group>
    </>
  )
}
