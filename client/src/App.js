import React from 'react'
import { Container } from 'react-bootstrap'

import { Provider as GlobalContextProvider } from './contexts/GlobalContext'
import TitleBar from './components/TitleBar'
import MainForm from "./components/MainForm"
import ThankYouBox from './components/ThankYouBox'
import Dialogs from './components/Dialogs'

export default function App() {

  return (
    <GlobalContextProvider>
      <TitleBar />
      <Container>
        <h1 style={{ paddingTop: "72px" }}>Storm Map Generator</h1>
        <MainForm />
        <ThankYouBox />
      </Container>
      <Dialogs />
    </GlobalContextProvider>
  )
}
