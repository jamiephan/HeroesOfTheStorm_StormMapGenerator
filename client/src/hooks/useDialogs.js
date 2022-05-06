import React, { useContext } from 'react'
import GlobalContext from "../contexts/GlobalContext"

export default function useDialogs() {
    const { dispatch } = useContext(GlobalContext)

    const alert = (message, title = "Error", callback) => {
        dispatch({ type: "SHOW_DIALOG", message: (<pre>{message}</pre>), title, onClose: callback, dialogType: "ALERT" })
    }
    const confirm = (message, callback) => {
        dispatch({ type: "SHOW_DIALOG", message: (<pre>{message}</pre>), title: "Are you sure?", onClose: callback, onSubmit: callback, dialogType: "CONFIRM" })
    }
    const prompt = (message, callback) => {
        dispatch({ type: "SHOW_DIALOG", message: (<pre>{message}</pre>), title: "Please fill in the data:", onClose: callback, onSubmit: callback, dialogType: "PROMPT" })
    }

    return {
        alert, confirm, prompt
    }
}
