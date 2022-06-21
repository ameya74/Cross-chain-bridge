const express = require('express');
const bodyParser = require("body-parser");
var morgan = require('morgan');
const cors = require('cors');
require('dotenv').config()



const app = express();

//middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(cors('*'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const checkPendingRouter = require("./routes/checkPendingRoute");



app.get("/",async(req,res) =>{
    res.status(200).json({
        status:true,
        msg:"Working..."
    })
})

app.use("/api",checkPendingRouter);

const PORT = process.env.PORT || 8081;

app.listen(PORT,() =>{
    console.log(`Server is running at port ${PORT}`)
})
