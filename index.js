import Express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors'
import AuthRoute from './Routes/Auth.route.js'
import UserRoute from './Routes/User.route.js'
import PostRoute from './Routes/Post.route.js'
import UploadRoute from './Routes/UploadRoute.js'

dotenv.config();
const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => app.listen(PORT, () => console.log(`app is running at ${PORT}`)))
    .catch((error) => console.log(error))

//Routes
const app = Express();

//to serve images for public
app.use(Express.static('public'))
app.use('/images', Express.static('images'))

//Middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors())


//usage of route
app.use('/auth', AuthRoute)
app.use('/user', UserRoute)
app.use('/post', PostRoute)
app.use('/upload', UploadRoute)
