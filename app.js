// Import the express 
import cookieParser from "cookie-parser";
import express from "express"
import requestIp from "request-ip"
import {env} from "./config/env.js"
import {shoternedRouter} from "./routes/shorten.routes.js"
import { authoRouter } from "./routes/autho.routes.js";
import { middleVerifyJwt } from "./middleware/autho_jwt_verify.js";

const app=express();
app.use(express.static("public"));

// Use to req.body for given the data
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs")
app.use(cookieParser())

app.use(requestIp.mw());

app.use(middleVerifyJwt)



app.use(authoRouter)
app.use(shoternedRouter);
app.use((req,res,next)=>{
   res.locals.user=req.user;
   return next();
})

// Define port for serverṇ
const PORT =env.PORT;

// Function to load saved links from JSON file

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});