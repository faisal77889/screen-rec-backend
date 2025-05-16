const mongoose = require("mongoose");

const connectDB = async () =>{
    try {
        await mongoose.connect("mongodb+srv://faisalhassan77889:Fai123sal123@loom-recorder.42mclwn.mongodb.net/?retryWrites=true&w=majority&appName=loom-recorder/backend")
    } catch (error) {
        console.log("Something went wrong " + error.message)
    }
}

module.exports = connectDB;