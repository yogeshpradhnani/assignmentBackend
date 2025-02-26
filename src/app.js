import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path  from 'path'
const app = express()

app.use(cors({
    origin: '*',
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import

import healthcheckRoute from './routes/healthcheck.route.js'
import userRoute from './routes/user.route.js'
import unitRoute from './routes/unit.route.js'
import listRoute from './routes/listing.route.js'
import bookRoute from './routes/booking.route.js'
app.use(express.static(path.join('./public/temp')));

//routes declaration
app.use('/api/v1/healthCheck',healthcheckRoute)
app.use('/api/v1/user',userRoute)
app.use('/api/v1/unit',unitRoute)
app.use('/api/v1/list',listRoute)
app.use('/api/v1/book',bookRoute)


export { app }