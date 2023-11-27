const express = require("express")
const path = require("path")
const { upload } = require("../multer")
const User = require("../models/user")
const ErrorHandler = require("../utils/ErrorHandler")
const fs = require("fs")

const router = express.Router()

router.post("/create-user", upload.single("file"), async (req, res, next) => {
    const { name, email, password } = req.body
    const userEmail = await User.findOne({ email })

    if (userEmail) {
        const filename = req.file.filename
        const filepath = `uploads/${filename}`
        fs.unlink(filepath, (err) => {
            if (err) {
                console.log(err)
                res.status(500).json({ message: "Error while deleting file" })
            } else {
                res.json({ message: "File deleted successfully" })
            }
        })
        return next(new ErrorHandler("User already exists", 400))
    }

    const filename = req.file.filename
    const fileUrl = path.join(filename)

    const avatar = fileUrl

    const user = {
        name: name,
        email: email,
        password: password,
        avatar: {
            public_id: name,
            url: fileUrl
        }
    }

    const newUser = await User.create(user)

    res.status(201).json({
        success: true,
        newUser
    })
})

module.exports = router