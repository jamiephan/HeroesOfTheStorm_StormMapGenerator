/* eslint-disable no-control-regex */
import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, ButtonToolbar, Dropdown, Spinner, SplitButton } from 'react-bootstrap'
import { PlusLg, Upload } from 'react-bootstrap-icons'
import useDialogs from '../../hooks/useDialogs'

export default function FileUploadBar(props) {

  const { alert, prompt } = useDialogs()

  // Templates
  const [templates, setTemplates] = useState([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)

  useEffect(() => {
    (async () => {
      // Load Templates
      const templateResponse = await fetch("/templates/" + props.fileType.toLowerCase())
      const templateResponseJSON = await templateResponse.json()
      setTemplates(templateResponseJSON)
      setIsLoadingTemplates(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const handleUploadFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "." + props.fileType.toLowerCase()

    input.onchange = async () => {
      const file = input.files[0]
      if (!file.name.toLowerCase().endsWith("." + props.fileType.toLowerCase())) {
        // Should not be here if browsers behaves
        return alert("Invalid File type")
      }
      if (!/^[\x00-\x7F]*$/.test(file.name)) {
        return alert("The file name contains invalid characters. Only ASCII characters are allowed.")
      }
      if (props.files.map(f => f.name).includes(file.name.toLowerCase())) {
        return alert("Duplicate File Detected")

      }
      const content = await file.text()
      props.setFiles(fs => [...fs, { name: file.name.toLowerCase(), content }])

    }

    input.click()
  }


  const handleNewFile = templateId => {
    if (templates.length === 0) return alert(`No ${props.fileType.toUpperCase()} Templates available. Try refresh the page.`)

    prompt(`Using example: ${templates[templateId].name}\n\nPlease enter the new ${props.fileType.toUpperCase()} filename:`, fileName => {
      if (fileName === false) return
      if (!fileName) return alert("Empty File Name");
      fileName = fileName.toLocaleLowerCase()
      fileName = fileName.endsWith(("." + props.fileType.toLowerCase())) ? fileName : fileName + ("." + props.fileType.toLowerCase())
      if (!/^[\x00-\x7F]*$/.test(fileName)) {
        return alert("The file name contains invalid characters. Only ASCII characters are allowed.")
      }
      if (fileName && !props.files.map(f => f.name).includes(fileName) && fileName !== ("." + props.fileType.toLowerCase())) {
        props.setFiles(fs => [...fs, {
          name: fileName, content: props.templateFn(templates[templateId])
        }])
      } else {
        alert("Invalid File name / Duplicated File name")
      }

    })
  }

  return (
    <ButtonToolbar>
      <ButtonGroup>
        <SplitButton
          variant="primary"
          title={
            isLoadingTemplates ?
              <><Spinner animation="border" size="sm" /> Loading {props.fileType.toUpperCase()} Examples ...</> :
              <><PlusLg /> New {props.fileType.toUpperCase()} File</>
          }
          onClick={() => handleNewFile(0)}
          disabled={isLoadingTemplates}
        >
          <Dropdown.Header>{props.fileType.toUpperCase()} File Examples</Dropdown.Header>
          {
            templates.map((t, i) => {
              // Dont show the empty template (first)
              if (i === 0) return false
              return (<Dropdown.Item key={i} onClick={() => handleNewFile(i)}>{t.name}</Dropdown.Item>)
            })
          }
          {/* <Dropdown.Divider /> */}
        </SplitButton>

        <Button variant="outline-primary" onClick={handleUploadFile}><Upload /> Upload {props.fileType.toUpperCase()} File</Button>
      </ButtonGroup>
    </ButtonToolbar>
  )
}
