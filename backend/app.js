const express = require("express")
const ErrorHandler = require("./middleware/error")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use("/", express.static("uploads"))
app.use(bodyParser.urlencoded({ extended: true }))

//config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({
        path: "backend/config/.env"
    })
}

//import routes
const user = require("./controllers/userController")

app.use("/api/v2/user", user)

//Error handling
app.use(ErrorHandler)

module.exports = app