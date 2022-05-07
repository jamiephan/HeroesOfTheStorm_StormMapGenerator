import React, { useContext } from 'react'
import { Button, Container, Nav, Navbar } from 'react-bootstrap'

import GlobalContext from "../contexts/GlobalContext"

export default function TitleBar() {
  const { state } = useContext(GlobalContext)

  return (
    <Navbar bg="dark" variant="dark" style={state?.installer?.isInstaller ? { '-webkit-app-region': 'drag' } : {}} className="titleBar">
      <Container>
        <Navbar.Brand href="/#">
          <img
            alt=""
            src="/logo192.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{' '}
          Storm Map Generator
          {(state?.installer?.isInstaller && state?.installer?.mapName) && " - for " + state.installer.mapName}
        </Navbar.Brand>
        {state?.installer?.isInstaller && (<>
          <Navbar.Collapse>
            <Nav className="me-auto my-2 my-lg-0" />
            <Button variant="danger" style={{ '-webkit-app-region': 'no-drag' }} onClick={window.close}>
              Close
            </Button>
          </Navbar.Collapse>
        </>)}
      </Container>
    </Navbar>
  )
}
