import React from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'

export default function TooltipButton(props) {
  return (
    <OverlayTrigger
      placement={props.placement || "top"}
      delay={{ show: props.showDelay || 100, hide: props.hideDelay || 100 }}
      overlay={overlayProps =>
        <Tooltip {...overlayProps}>
          {props.tooltip || ""}
        </Tooltip>
      }
    >
      <Button variant={props.variant || "primary"} onClick={props.onClick || null} className={props.className || ""}>
        {props.children}
      </Button>
    </OverlayTrigger>
  )
}
