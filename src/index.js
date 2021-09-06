require("dotenv").config()

const express = require("express")
const fetch = require("node-fetch")

const app = express()

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const respError = require("./Model/Responses/Error")

app.use(express.static('public'))

app.use("/list", require("./routes/api/list"))
app.use("/templates", require("./routes/api/templates"))
app.use("/build", require("./routes/api/build"))

app.get("/ratelimit", async (req, res) => {
  try {
    const response = await fetch(`https://${host}/rate_limit`)
    const json = await response.json()
    res.json(json)
  } catch (e) {
    res.status(500).json(respError("Github API Error"))
  }
})

app.all("*", (req, res) => {
  res.redirect("/")
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log("Server Listening on Port " + port.toString())
})