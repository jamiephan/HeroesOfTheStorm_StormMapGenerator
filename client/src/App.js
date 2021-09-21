import React from 'react'
import TitleBar from './components/TitleBar'
import MainForm from "./components/MainForm"
import ThankYouBox from './components/ThankYouBox'
import { Container } from 'react-bootstrap'

export default function App() {

  return (
    <>
      <TitleBar />
      <Container>
        <h1 style={{ margin: "15px 0" }}>Storm Map Generator</h1>
        <MainForm />
        <ThankYouBox />
      </Container>
    </>
  )
}
