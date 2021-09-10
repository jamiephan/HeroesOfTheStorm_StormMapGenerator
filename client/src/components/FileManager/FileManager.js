import React from 'react'
import { Form } from 'react-bootstrap'
import FileList from './FileList'
import FileUploadBar from './FileUploadBar'

export default function FileManager(props) {
  return (
    <>
      <Form.Group className="mb-3" style={{ marginTop: "20px" }}>

        {/* File List */}
        <Form.Label>Additional <code>{props.fileType.toUpperCase()}</code> Files:</Form.Label>
        <FileList
          files={props.files}
          setFiles={props.setFiles}
          fileType="xml"
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
          mimeType={props.mimeType}
          templateFn={props.template}
        />
      </Form.Group>
    </>
  )
}
