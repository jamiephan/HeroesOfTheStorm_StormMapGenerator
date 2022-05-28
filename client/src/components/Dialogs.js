import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'

import GlobalContext from "../contexts/GlobalContext"

export default function Dialog() {

    const { state, dispatch } = useContext(GlobalContext)
    const [promptInputValue, setPromptInputValue] = useState("")
    const inputHtml = useRef(null)

    const handleAlertClose = () => {
        dispatch({ type: "CLOSE_DIALOG" })
        state?.dialog?.onClose?.()
    }

    const handleConfirmClose = (status = false) => {
        dispatch({ type: "CLOSE_DIALOG" })
        state?.dialog?.onClose?.(status)
    }

    const handlePromptSubmit = () => {
        dispatch({ type: "CLOSE_DIALOG" })
        state?.dialog?.onClose?.(promptInputValue)
    }
    const handlePromptClose = () => {
        dispatch({ type: "CLOSE_DIALOG" })
        state?.dialog?.onClose?.(false)
    }

    useEffect(() => {
        if (state?.dialog?.dialogType === "PROMPT") {
            inputHtml.current.focus()
        }
    }, [state?.dialog?.dialogType])

    return (
        <>
            {/* Alert Box */}
            {state?.dialog?.dialogType === "ALERT" && (
                <Modal
                    size="lg"
                    centered
                    show={state?.dialog?.show}
                    onHide={handleAlertClose}
                >
                    <Modal.Header closeButton>
                        {state?.dialog?.title && (
                            <Modal.Title>
                                {state?.dialog?.title}
                            </Modal.Title>
                        )}
                    </Modal.Header>
                    <Modal.Body>
                        {state?.dialog?.message}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleAlertClose}>Close</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Confirm Box */}
            {state?.dialog?.dialogType === "CONFIRM" && (
                <Modal
                    size="lg"
                    centered
                    show={state?.dialog?.show}
                    onHide={() => handleConfirmClose(false)}
                >
                    <Modal.Header closeButton>
                        {state?.dialog?.title && (
                            <Modal.Title>
                                {state?.dialog?.title}
                            </Modal.Title>
                        )}
                    </Modal.Header>
                    <Modal.Body>
                        {state?.dialog?.message}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => handleConfirmClose(true)}>OK</Button>
                        <Button onClick={() => handleConfirmClose(false)}>Cancel</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Prompt Box */}
            {state?.dialog?.dialogType === "PROMPT" && (
                <Modal
                    size="lg"
                    centered
                    show={state?.dialog?.show}
                    onHide={() => handlePromptClose()}
                >
                    <Modal.Header closeButton>
                        {state?.dialog?.title && (
                            <Modal.Title>
                                {state?.dialog?.title}
                            </Modal.Title>
                        )}
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={e => { e.preventDefault(); handlePromptSubmit() }}>
                            <Form.Group className="mb-3">
                                <Form.Label>{state?.dialog?.message}</Form.Label>
                                <Form.Control
                                    type="text"
                                    autoFocus
                                    value={promptInputValue}
                                    ref={inputHtml}
                                    onChange={(e) => setPromptInputValue(e.target.value)}

                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => handlePromptSubmit()}>OK</Button>
                        <Button onClick={() => handlePromptClose(false)}>Cancel</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    )
}
