import React from 'react'
import { Container, Navbar } from 'react-bootstrap'

export default function TitleBar() {
  return (
    <Navbar bg="dark" variant="dark">
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
        </Navbar.Brand>
      </Container>
    </Navbar>
  )
}
