
const errorMessages = {
    SERVER_ERROR: "SERVER_ERROR"
}

const errorFormat = {
    SERVER_ERROR: { message: errorMessages.SERVER_ERROR }
}

const errors = {
    SERVER_ERROR: (res) => res.status(500).send(errorFormat.SERVER_ERROR)
}
module.exports = {
    errorMessages,
    errorFormat,
    errors
}