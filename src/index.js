require("dotenv").config()

const express = require("express")

const app = express()

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static('public'))

app.use("/list", require("./routes/api/list"))
app.use("/templates", require("./routes/api/templates"))
app.use("/default", require("./routes/api/default"))
app.use("/build", require("./routes/api/build"))

// Redirect everything back to "/", the webapp interface
app.all("*", (req, res) => {
  res.redirect("/")
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log("Server Listening on Port " + port.toString())
})