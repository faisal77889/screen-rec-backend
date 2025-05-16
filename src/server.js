const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const path = require("path");


const authRouter = require("./routes/auth");
const videoRouter = require("./routes/videoRouter");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // to parse incoming JSON requests
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/videos", express.static(path.join(__dirname, "uploads/videos")));
app.use("/uploads/thumbnails", express.static(path.join(__dirname, "uploads/thumbnails")));


app.use("/",authRouter);
app.use("/",videoRouter);



connectDB()
    .then(()=>{
        console.log("connected to the database cluster successfully");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err)=>{
        console.log("There might be error while connecting to the database " + err.message);
    })

