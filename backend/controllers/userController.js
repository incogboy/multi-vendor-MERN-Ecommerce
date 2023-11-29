const express = require("express")
const path = require("path")
const { upload } = require("../multer")
const User = require("../models/user")
const ErrorHandler = require("../utils/ErrorHandler")
const fs = require("fs")
const jwt = require("jsonwebtoken")
const sendMail = require("../utils/sendMail")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const sendToken = require("../utils/jwtToken")

const router = express.Router()

//create-user || sign-up
router.post("/create-user", upload.single("file"), async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        const userEmail = await User.findOne({ email })

        if (userEmail) {
            const filename = req.file.filename
            const filepath = `uploads/${filename}`
            fs.unlink(filepath, (err) => {
                if (err) {
                    console.log(err)
                    res.status(500).json({ message: "Error while deleting file" })
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

        const activationToken = createActivationToken(user)
        const activationUrl = `http://localhost:3000/activation/${activationToken}`

        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`
            })
            res.status(201).json({
                success: true,
                message: `please check your email: ${user.email} to activate your account`
            })
        } catch (error) {
            return next(new ErrorHandler(error.message, 500))
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400))
    }
})

//create activation token
const createActivationToken = (user) => {
    return jwt.sign(user, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m"
    })
}

//activate user
router.post("/activation", catchAsyncErrors(async (req, res, next) => {
    try {
        const { activation_token } = req.body

        const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET)

        if (!newUser) {
            return next(new ErrorHandler("Invalid Token", 400))
        }
        const { name, email, password, avatar } = newUser

        User.create({
            name,
            email,
            avatar,
            password
        })

        sendToken(newUser, 201, res)
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }
}))

module.exports = router