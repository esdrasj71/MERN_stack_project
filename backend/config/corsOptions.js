const allowedOrigins = require('./allowedOrigens')

const corsOptions = {
    orgin: (origin, callback) => {
        if (allowedOrigins.indexOf(orgin) != -1 || !orgin){
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions