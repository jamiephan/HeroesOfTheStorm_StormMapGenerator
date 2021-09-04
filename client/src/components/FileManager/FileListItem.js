import React from 'react'
import { ButtonGroup, ButtonToolbar, ListGroup } from 'react-bootstrap'
import {
  Download,
  InputCursorText,
  Pencil, Trash
} from 'react-bootstrap-icons'
import TooltipButton from "../Shared/TooltipButton"

export default function FileListItem(props) {
  return (
    <ListGroup.Item>
      <ButtonToolbar>
        <div className="me-auto" style={{
          display: "flex",
          lineHeight: "1.5",
          padding: ".375rem .75rem",
          // CSS Stolen from the buttons
        }}><code>{props.name}</code></div>
        <ButtonGroup>
          <TooltipButton tooltip="Edit" variant="success" onClick={props.editFn}>
            <Pencil />
          </TooltipButton>
          <TooltipButton tooltip="Rename" variant="primary" onClick={props.renameFn}>
            <InputCursorText />
          </TooltipButton>
          <TooltipButton tooltip="Download" variant="warning" onClick={props.downloadFn}>
            <Download />
          </TooltipButton>
          <TooltipButton tooltip="Delete" variant="danger" onClick={props.deleteFn}>
            <Trash />
          </TooltipButton>
        </ButtonGroup>
      </ButtonToolbar>
    </ListGroup.Item>
  )
}
