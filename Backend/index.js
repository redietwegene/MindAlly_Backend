import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import userRoutes from "./routes/authenticaionRoutes/userAuth.js"
import otpRoutes from "./routes/authenticaionRoutes/otpRoutes.js"
// import googleRoutes from "./routes/authenticaionRoutes/loginwithGoogle.js"
// import session from "express-session";
// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";


 


dotenv.config();
const app = express();
app.use(bodyParser.json());


mongoose
    .connect(process.env.Mongo_url)
    .then(() => {
        console.log("Database connected succesfully")
    })














app.use(cors({
 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials:true
}));


app.use("/api/user", userRoutes)
app.use("/api/otp", otpRoutes)
// app.use("/api/google",googleRoutes)


app.listen(process.env.PORT, () => {
    console.log(   `server is running on port ${process.env.PORT}`)
})

