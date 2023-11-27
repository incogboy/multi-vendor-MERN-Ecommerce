const ErrorHandler = require("../utils/ErrorHandler")

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "internal Server Error"

    //something wrong with mongodb
    if (err.name === "CastError") {
        const message = `Resources not found with this id, Invalid ${err.path}`
        err = new ErrorHandler(message, 400)
    }

    //Duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message, 400)
    }

    //jwt error
    if (err.name === "JsonWebTokenError") {
        const message = new `Your token is invalid please try again later`
        err = new ErrorHandler(message, 400)
    }

    //jwt expired
    if (err.name === "TokenExpiredError") {
        const message = `Your token is expired. Please try again later`
        err = new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}